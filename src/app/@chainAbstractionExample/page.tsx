"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountWrapperContext } from "@/context/wrapper";
import { SCOPE_URL, TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useBalance } from "wagmi";
import { baseSepolia, sepolia } from "viem/chains";
const ChainAbstractionExample = () => {
  const { kernelAccountClient } = useAccountWrapperContext();

  const [amount, setAmount] = useState("");

  const { data: usdcBalance } = useBalance({
    address: kernelAccountClient?.account?.address,
    token: USDC_ADDRESS,
    chainId: baseSepolia.id,
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: tokenBalance } = useBalance({
    address: kernelAccountClient?.account?.address,
    token: TOKEN_ADDRESS,
    chainId: sepolia.id,
    query: {
      refetchInterval: 5000,
    },
  });

  const {
    mutate: sendTransaction,
    isPending,
    data: txHash,
  } = useMutation({
    mutationKey: ["chainAbstraction"],
    mutationFn: async () => {
      return kernelAccountClient?.sendUserOperation({
        account: kernelAccountClient.account,
        calls: [
          {
            to: USDC_ADDRESS,
            value: BigInt(0),
            data: "0x",
          },
        ],
      });
    },
  });

  const {
    mutate: swapTokens,
    isPending: isSwapping,
    data: swapTxHash,
  } = useMutation({
    mutationKey: ["swapTokens"],
    mutationFn: async () => {
      return kernelAccountClient?.sendUserOperation({
        account: kernelAccountClient.account,
        calls: [
          {
            to: TOKEN_ADDRESS,
            value: BigInt(0),
            data: "0x",
          },
        ],
      });
    },
  });

  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Chain Abstraction</h4>

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Mint USDC on Base</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">2. Swap USDC to 0DEV on Sepolia</Badge>
        </div>

        <p className="text-sm">
          USDC Balance: {usdcBalance?.value.toString()} {usdcBalance?.symbol}
        </p>
        <p className="text-sm">
          0DEV Balance: {tokenBalance?.value.toString()} {tokenBalance?.symbol}
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

export default ChainAbstractionExample;
