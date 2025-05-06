"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { EXPLORER_URL, SEPOLIA, ZERODEV_TOKEN_ADDRESS, ZERODEV_DECIMALS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, parseUnits } from "viem";

const GasSponsorshipExample = () => {
  const { embeddedWallet, kernelAccount, kernelAccountClient } = useAccountProviderContext();
  const [amount, setAmount] = useState("");

  const {
    mutate: sendSponsoredTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: ["gasSponsorship sendTransaction", kernelAccountClient?.account?.address, amount],
    mutationFn: async () => {
      if (!kernelAccountClient) throw new Error("No kernel client found");
      if (!kernelAccount) throw new Error("No kernel account found");

      return kernelAccountClient.sendTransaction({
        account: kernelAccount,
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
          args: [kernelAccount.address, parseUnits(amount, ZERODEV_DECIMALS)],
        }),
        chain: SEPOLIA,
      });
      // return sendTransactionMutation({
      //   transaction: {
      //     account: kernelAccount,
      //     to: ZERODEV_TOKEN_ADDRESS,
      //     value: BigInt(0),
      //     data: encodeFunctionData({
      //       abi: [
      //         {
      //           name: "mint",
      //           type: "function",
      //           inputs: [
      //             { name: "to", type: "address" },
      //             { name: "amount", type: "uint256" },
      //           ],
      //         },
      //       ],
      //       functionName: "mint",
      //       args: [embeddedWallet?.address, parseUnits(amount, ZERODEV_DECIMALS)],
      //     }),
      //     chain: CHAIN,
      //   },
      // });
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
        className="flex w-full flex-col gap-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        aria-disabled={!embeddedWallet}
      >
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">Mint ZDEV Token</Badge>
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
          onClick={() => sendSponsoredTransaction()}
        >
          {isPending ? "Sending..." : "Send Sponsored Transaction"}
        </Button>

        {/* Tx link */}
        {txHash && (
          <a
            href={`${EXPLORER_URL}/tx/${txHash}`}
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
