"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountActions } from "@/context/account-actions-provider";
import { useAccountWrapperContext } from "@/context/wrapper";
import { SCOPE_URL } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData } from "viem";
const BatchingExample = () => {
  const {} = useAccountActions();
  const { embeddedWallet, kernelAccountClient } = useAccountWrapperContext();

  const {
    mutate: sendTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: ["batching sendUserOperation"],
    mutationFn: async () => {
      if (!kernelAccountClient?.account) throw new Error("No account found");

      const TOKEN_ADDRESS = "0x3Ad1E36CCC4d781bf73E24533943c745E50c569b";

      return kernelAccountClient?.sendUserOperation({
        account: kernelAccountClient.account,
        calls: [
          {
            to: TOKEN_ADDRESS,
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
              args: [kernelAccountClient.account.address, BigInt(1000000)],
            }),
          },
          {
            to: TOKEN_ADDRESS,
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
              args: ["0x65A49dF64216bE58F8851A553863658dB7Fe301F", BigInt(1000000)],
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

      <div className="bg-primary hover:bg-primary text-background absolute right-0 -bottom-4 flex h-8 w-full items-center justify-evenly text-sm hover:shadow-none">
        <span>
          Privy: {embeddedWallet?.address.slice(0, 6)}...{embeddedWallet?.address.slice(-4)}
        </span>
        <span>|</span>
        <span>7702 Deployed: Yes</span>
      </div>

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Mint Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Token Symbol"
            value="ZeroDev"
            disabled={true}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">2. Transfer Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value="1000000"
            disabled={true}
          />
        </div>

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
