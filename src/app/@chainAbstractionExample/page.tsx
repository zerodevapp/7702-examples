"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { BASE_USDC_ADDRESS, EXPLORER_URL, SEPOLIA_USDC_ADDRESS, ZERODEV_TOKEN_ADDRESS } from "@/lib/constants";
import { ZERODEV_TOKEN_ABI } from "@/lib/constants/zeroDevTokenAbi";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { useBalance } from "wagmi";
const ChainAbstractionExample = () => {
  const { kernelAccountClient, intentClient, createIntentClient } = useAccountProviderContext();

  const [amount, setAmount] = useState("");
  const { embeddedWallet } = useAccountProviderContext();

  const { data: cab, refetch: refetchCAB } = useQuery({
    queryKey: ["usdc-balance", intentClient?.account?.address],
    queryFn: async () => {
      if (!intentClient) return null;
      const cab = await intentClient.getCAB({
        // Specify any networks you want to aggregate.
        // If you skip this flag, it will aggregate from all the networks we support, but it may be slower.
        networks: [sepolia.id, baseSepolia.id],

        // Specify the tokens you want to aggregate balances for.
        // If you skip this flag, it will return all the tokens we support, but it may be slower.
        tokenTickers: ["USDC"],
      });

      console.log("CAB TOKENS", cab);

      return cab.tokens.reduce((acc, token) => {
        return acc + BigInt(token.amount);
      }, BigInt(0));
    },
    enabled: !!intentClient,
  });

  const { data: tokenBalance } = useBalance({
    address: embeddedWallet?.address,
    token: ZERODEV_TOKEN_ADDRESS,
    chainId: sepolia.id,
    query: {
      refetchInterval: 5000,
    },
  });

  const {
    mutate: sendTransaction,
    isPending,
    data: intentData,
  } = useMutation({
    mutationKey: ["chainAbstraction"],
    mutationFn: async () => {
      if (!intentClient) throw new Error("Intent client not found");
      if (!kernelAccountClient?.account) throw new Error("Kernel account client not found");

      return intentClient.sendUserIntent({
        calls: [
          {
            to: SEPOLIA_USDC_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [ZERODEV_TOKEN_ADDRESS, parseUnits(amount, 6)],
            }),
          },
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: ZERODEV_TOKEN_ABI,
              functionName: "swap",
              args: [parseUnits(amount, 6), kernelAccountClient.account.address, kernelAccountClient.account.address],
            }),
          },
        ],
        inputTokens: [
          {
            chainId: baseSepolia.id,
            address: BASE_USDC_ADDRESS,
            amount: parseUnits(amount, 6),
          },
        ],
        outputTokens: [
          {
            chainId: sepolia.id,
            address: SEPOLIA_USDC_ADDRESS,
            amount: parseUnits(amount, 6),
          },
        ],
      });
    },
    onSuccess: () => {
      toast.success("Transaction sent successfully");
      refetchCAB();
    },
    onError: (error) => {
      toast.error("Error sending transaction");
      console.error(error);
    },
  });

  useQuery({
    queryKey: ["intentStatus", intentData],
    queryFn: async () => {
      if (!intentData) return null;
      if (!intentClient) return null;

      // Wait for the intent to be opened on all input chains
      // NOTE: if you just want to wait for the intent to fully resolve, you don't need to wait
      // for the input intents.  Just wait for the execution intent.
      await Promise.all(
        intentData.inputsUiHash.map(async (data) => {
          const openReceipts = await intentClient.waitForUserIntentOpenReceipt({
            uiHash: data.uiHash,
          });
          console.log(
            `Intent opened on chain ${openReceipts?.openChainId} with transaction hash: ${openReceipts?.receipt.transactionHash}`,
          );
          toast.success(`Intent opened on ${openReceipts?.openChainId}!`);
        }),
      );

      // Wait for final execution on the destination chain
      const receipt = await intentClient.waitForUserIntentExecutionReceipt({
        uiHash: intentData.outputUiHash.uiHash,
      });
      toast.success("Transaction completed successfully");
      console.log(
        `Intent executed on chain: ${receipt?.executionChainId} with transaction hash: ${receipt?.receipt.transactionHash}`,
      );
    },
    enabled: Boolean(intentData && intentClient),
  });

  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Chain Abstraction</h4>

      {/* Request USDC from Circle Faucet on Base */}
      <Link
        href={"https://faucet.circle.com/"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary my-4 text-sm underline underline-offset-4"
      >
        Request Circle USDC on Base Testnet
      </Link>

      {!intentClient ? (
        <Button
          className="my-4"
          onClick={() => createIntentClient()}
        >
          Initialise Intents Plugin
        </Button>
      ) : null}

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Swap USDC (Base) to ZDEV (Sepolia)</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <p className="text-sm">USDC Chain Abstracted Balance: {formatUnits(cab ?? BigInt(0), 6)} </p>
        <p className="text-sm">
          ZDEV (Sepolia) Balance: {formatUnits(tokenBalance?.value ?? BigInt(0), tokenBalance?.decimals ?? 18)}{" "}
        </p>

        <Button
          disabled={isPending}
          onClick={() => sendTransaction()}
        >
          {isPending ? "Sending..." : "Send Chain Abstracted Transaction"}
        </Button>

        {intentData?.outputUiHash.uiHash && (
          <a
            href={`${EXPLORER_URL}/tx/${intentData.outputUiHash.uiHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline underline-offset-4"
          >
            View Transaction
          </a>
        )}
      </div>
    </div>
  );
};

export default ChainAbstractionExample;
