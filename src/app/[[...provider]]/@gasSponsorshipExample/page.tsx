"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { EXPLORER_URL, ZERODEV_DECIMALS, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { Loader } from "lucide-react";

const GasSponsorshipExample = () => {
  const { embeddedWallet, kernelAccount, kernelAccountClient, provider } = useAccountProviderContext();
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
        chain: sepolia,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const signInTooltipRef = useRef<HTMLDivElement>(null);

  const isDisabled = useMemo(() => !embeddedWallet || !kernelAccount, [embeddedWallet, kernelAccount]);

  useEffect(() => {
    const signInTooltip = signInTooltipRef.current;
    const container = containerRef.current;
    if (!isDisabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      signInTooltip?.style.setProperty("left", `${e.clientX + 10}px`);
      signInTooltip?.style.setProperty("top", `${e.clientY + 10}px`);
    };
    const handleMouseEnter = () => {
      signInTooltip?.style.setProperty("opacity", "1");
    };
    const handleMouseLeave = () => {
      signInTooltip?.style.setProperty("opacity", "0");
    };
    if (signInTooltip && container) {
      // follow mouse within the container
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      signInTooltip?.removeEventListener("mousemove", handleMouseMove);
      container?.removeEventListener("mouseenter", handleMouseEnter);
      container?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDisabled]);

  return (
    <>
      {/* sign in tool tip */}
      {isDisabled && (
        <div
          ref={signInTooltipRef}
          className="border-primary bg-background fixed top-0 left-0 z-[99] max-w-xs border-2 p-4 text-sm opacity-0"
        >
          Create 7702 Account with <span className="capitalize">{provider}</span> to try out the examples!
        </div>
      )}
      <div
        className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:select-none"
        ref={containerRef}
        aria-disabled={isDisabled}
      >
        <h4 className="text-lg font-medium">Sponsor a Transaction</h4>

        <div className="flex w-full flex-col gap-4">
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
            disabled={isPending || isDisabled}
            onClick={() => sendSponsoredTransaction()}
          >
            {isPending ? "Sending..." : "Send Sponsored Transaction"}

            {isPending && <Loader className="text-primary ml-2 h-4 w-4 animate-spin" />}
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
    </>
  );
};

export default GasSponsorshipExample;
