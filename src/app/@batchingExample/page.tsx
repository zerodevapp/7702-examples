"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { EXPLORER_URL, ZERODEV_DECIMALS, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { useBalance } from "wagmi";

const BatchingExample = () => {
  const { kernelAccountClient, embeddedWallet } = useAccountProviderContext();

  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");

  const { data: balance } = useBalance({
    address: embeddedWallet?.address,
    token: ZERODEV_TOKEN_ADDRESS,
    query: {
      refetchInterval: 5000,
    },
    chainId: sepolia.id,
  });

  const {
    mutate: sendTransaction,
    isPending,
    data: userOpHash,
  } = useMutation({
    mutationKey: ["batching sendUserOperation", kernelAccountClient?.account?.address, amount, toAddress],
    mutationFn: async () => {
      if (!kernelAccountClient?.account) throw new Error("No kernel account client found");

      return kernelAccountClient?.sendUserOperation({
        calls: [
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: [
                {
                  name: "mint",
                  type: "function",
                  inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                },
              ],
              functionName: "mint",
              args: [kernelAccountClient.account.address, parseUnits(amount, ZERODEV_DECIMALS)],
            }),
          },
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: [
                {
                  name: "transfer",
                  type: "function",
                  inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                },
              ],
              functionName: "transfer",
              args: [toAddress, parseUnits(amount, ZERODEV_DECIMALS)],
            }),
          },
        ],
      });
    },
    onSuccess: (data) => {
      toast.success("Transaction sent successfully");
      console.log(data);
    },
    onError: (error) => {
      toast.error("Transaction failed");
      console.error(error);
    },
  });

  const { data: userOpReceipt, isLoading } = useQuery({
    queryKey: ["userOpReceipt", userOpHash],
    queryFn: async () => {
      if (!userOpHash) throw new Error("No transaction hash found");
      return await kernelAccountClient?.waitForUserOperationReceipt({
        hash: userOpHash,
      });
    },
    enabled: !!userOpHash,
  });

  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Batching Multiple Transactions</h4>

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Mint ZDEV</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">2. Transfer Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="To Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>

        <p className="text-sm">
          Balance: {formatUnits(balance?.value ?? BigInt(0), balance?.decimals ?? 18)} {balance?.symbol}
        </p>

        <Button
          disabled={isPending || isLoading}
          onClick={() => sendTransaction()}
        >
          {isPending || isLoading ? "Sending..." : "Send Batched Transaction"}
        </Button>

        {userOpReceipt && (
          <a
            href={`${EXPLORER_URL}/op/${userOpReceipt.receipt.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline underline-offset-4"
          >
            View Batched Transaction
          </a>
        )}
      </div>
    </div>
  );
};

export default BatchingExample;
