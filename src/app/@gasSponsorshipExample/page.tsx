"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountWrapperContext } from "@/context/wrapper";
import { chain, SCOPE_URL } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { zeroAddress } from "viem";

const GasSponsorshipExample = () => {
  const { embeddedWallet, kernelAccountClient } = useAccountWrapperContext();

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
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",
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
            href={`${SCOPE_URL}/op/${txHash}`}
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
