"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import {
  entryPoint,
  EXPLORER_URL,
  kernelVersion,
  baseSepoliaBundlerRpc,
  baseSepoliaPaymasterRpc,
  ZERODEV_DECIMALS,
  ZERODEV_TOKEN_ADDRESS,
} from "@/lib/constants";
import { ZERODEV_TOKEN_ABI } from "@/lib/constants/zeroDevTokenAbi";
import { useMutation } from "@tanstack/react-query";
import { toPermissionValidator } from "@zerodev/permissions";
import { CallPolicyVersion, ParamCondition, toCallPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  KernelAccountClient,
} from "@zerodev/sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { encodeFunctionData, http, parseUnits, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";

const PermissionsExample = () => {
  const [amount, setAmount] = useState<string>("");
  const [sessionAccountAddress, setSessionAccountAddress] = useState<`0x${string}` | null>(null);

  const [sessionKernelClient, setSessionKernelClient] = useState<KernelAccountClient | null>(null);

  const {
    kernelAccount: masterKernelAccount,
    kernelAccountClient: masterKernelAccountClient,
    ecdsaValidator: masterEcdsaValidator,
    embeddedWallet,
    provider,
    kernelAccount,
  } = useAccountProviderContext();

  const publicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  const createSessionKey = async () => {
    if (!masterKernelAccount?.address || !masterKernelAccountClient?.account || !masterEcdsaValidator)
      throw new Error("Kernel account client not found");
    if (!publicClient) throw new Error("Public client not found");

    // if (serialisedSessionKey) {
    //   sessionKeyKernelAccount = await deserializePermissionAccount(
    //     publicClient,
    //     entryPoint,
    //     kernelVersion,
    //     serialisedSessionKey,
    //   );
    // } else {
    const _sessionPrivateKey = generatePrivateKey();

    const sessionAccount = privateKeyToAccount(_sessionPrivateKey as `0x${string}`);

    const sessionKeySigner = await toECDSASigner({
      signer: sessionAccount,
    });

    const callPolicy = toCallPolicy({
      policyVersion: CallPolicyVersion.V0_0_4,
      permissions: [
        {
          target: ZERODEV_TOKEN_ADDRESS,
          valueLimit: BigInt(0),
          abi: ZERODEV_TOKEN_ABI,
          functionName: "transfer",
          args: [
            {
              condition: ParamCondition.NOT_EQUAL,
              value: zeroAddress,
            },
            {
              condition: ParamCondition.LESS_THAN,
              value: parseUnits("10", ZERODEV_DECIMALS),
            },
          ],
        },
      ],
    });

    const permissionPlugin = await toPermissionValidator(publicClient, {
      entryPoint: entryPoint,
      kernelVersion: kernelVersion,
      signer: sessionKeySigner,
      policies: [callPolicy],
    });

    const sessionKeyKernelAccount = await createKernelAccount(publicClient, {
      entryPoint,
      plugins: {
        sudo: masterEcdsaValidator,
        regular: permissionPlugin,
      },
      kernelVersion: kernelVersion,
      address: masterKernelAccount.address,
    });
    // save new session account
    setSessionAccountAddress(sessionAccount.address);
    // setSerialisedSessionKey(await serializePermissionAccount(sessionKeyKernelAccount, _sessionPrivateKey));

    const kernelPaymaster = createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(baseSepoliaPaymasterRpc),
    });
    const kernelClient = createKernelAccountClient({
      account: sessionKeyKernelAccount,
      chain: baseSepolia,
      bundlerTransport: http(baseSepoliaBundlerRpc),
      paymaster: {
        getPaymasterData(userOperation) {
          return kernelPaymaster.sponsorUserOperation({ userOperation });
        },
      },
    });

    setSessionKernelClient(kernelClient);
  };

  const {
    mutate: sendTransactionWithAmount,
    isPending,
    data: txHash,
  } = useMutation({
    mutationFn: async () => {
      if (!sessionKernelClient) throw new Error("Kernel client not found");
      if (!masterKernelAccount?.address) throw new Error("Kernel account client not found");

      return sessionKernelClient?.sendTransaction({
        calls: [
          {
            to: ZERODEV_TOKEN_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: ZERODEV_TOKEN_ABI,
              functionName: "transfer",
              args: ["0x65A49dF64216bE58F8851A553863658dB7Fe301F", parseUnits(amount, ZERODEV_DECIMALS)],
            }),
          },
        ],
      });
    },
    onSuccess: (data) => {
      console.log("Transaction sent successfully", data);
      toast.success("Transaction sent successfully", {
        action: {
          label: "View",
          onClick: () => {
            window.open(`${EXPLORER_URL}/tx/${data}`, "_blank");
          },
        },
      });
    },
    onError: (error) => {
      console.error("Transaction failed", error);
      toast.error("Transaction failed");
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
        <h4 className="text-lg font-medium">Permissions Example</h4>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="h-9 text-sm font-medium">1. Create a session key</Badge>

            <Button
              className="h-9"
              onClick={createSessionKey}
            >
              Create
            </Button>

            {sessionKernelClient && (
              <div className="w-full space-y-2">
                <p className="truncate text-sm">{sessionAccountAddress}</p>
                <p className="text-sm">
                  This key has permission to transfer less than 10 ZDEV from the master account.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="h-9 text-sm font-medium">2. Transfer ZDEV</Badge>
            <Input
              className="bg-background w-fit flex-1"
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-sm">This transaction will be rejected if the amount is not less than 10 ZDEV.</p>
          </div>

          <Button
            disabled={isPending}
            onClick={() => sendTransactionWithAmount()}
          >
            {isPending ? "Sending..." : "Send Transaction"}
          </Button>

          {txHash && (
            <a
              href={`${EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm underline underline-offset-4"
            >
              Explorer
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default PermissionsExample;
