"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProvider } from "@/context/account-provider";
import { useMutation } from "@tanstack/react-query";

const GasSponsorshipExample = () => {
  const { accountProvider } = useAccountProvider();

  const { mutate: sendTransaction, isPending } = useMutation({
    mutationFn: () => {
      return Promise.resolve();
    },
  });
  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Sponsor a Transaction</h4>

      <Button className="absolute right-0 -bottom-4 w-full">
        Sign In With <span className="capitalize">{accountProvider}</span>
      </Button>

      <div
        className="flex w-full cursor-not-allowed! flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4 opacity-50"
        aria-disabled={true}
      >
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Deploy Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Token Symbol"
          />
        </div>

        <Button
          disabled={isPending}
          onClick={() => sendTransaction()}
        >
          {isPending ? "Sending..." : "Send Sponsored Transaction"}
        </Button>
      </div>
    </div>
  );
};

export default GasSponsorshipExample;
