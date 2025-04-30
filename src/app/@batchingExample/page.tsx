"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountActions } from "@/context/account-actions-provider";
import { useAccountWrapperContext } from "@/context/wrapper";
import { ZERODEV_DECIMALS, SCOPE_URL, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import { useBalance } from "wagmi";
import { sepolia } from "viem/chains";
const BatchingExample = () => {
  const {} = useAccountActions();
  const { kernelAccountClient } = useAccountWrapperContext();

  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");

  const { data: balance } = useBalance({
    address: kernelAccountClient?.account?.address,
    token: ZERODEV_TOKEN_ADDRESS,
    query: {
      refetchInterval: 5000,
    },
    chainId: sepolia.id,
  });

  const {
    mutate: sendTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: ["batching sendUserOperation"],
    mutationFn: async () => {
      if (!kernelAccountClient?.account) throw new Error("No account found");

      return kernelAccountClient?.sendUserOperation({
        account: kernelAccountClient.account,
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
          disabled={isPending}
          onClick={() => sendTransaction()}
        >
          {isPending ? "Sending..." : "Send Batched Transaction"}
        </Button>

        {txHash && (
          <a
            href={`${SCOPE_URL}/op/${txHash}`}
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
