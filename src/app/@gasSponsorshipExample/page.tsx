"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountWrapperContext } from "@/context/wrapper";
import { chain, SCOPE_URL, ZERODEV_DECIMALS, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, parseUnits } from "viem";

const GasSponsorshipExample = () => {
  const { embeddedWallet, kernelAccountClient } = useAccountWrapperContext();

  const [amount, setAmount] = useState("");

  const {
    mutate: sendTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: ["gasSponsorship sendTransaction"],
    mutationFn: async () => {
      if (!kernelAccountClient?.account) throw new Error("No account found");
      return kernelAccountClient?.sendTransaction({
        account: kernelAccountClient.account,
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
        chain: chain,
      });
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Transaction sent successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to send transaction");
    },
  });
  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Sponsor a Transaction</h4>

      <div
        className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        aria-disabled={!embeddedWallet}
      >
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">Mint 0DEV Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button
          disabled={isPending}
          onClick={() => sendTransaction()}
        >
          {isPending ? "Sending..." : "Send Sponsored Transaction"}
        </Button>

        {/* Tx link */}
        {txHash && (
          <a
            href={`${SCOPE_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline underline-offset-4"
          >
            View Sponsored Transaction
          </a>
        )}
      </div>
    </div>
  );
};

export default GasSponsorshipExample;
