"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountWrapperContext } from "@/context/wrapper";
import {
  bundlerRpc,
  chain,
  entryPoint,
  kernelVersion,
  paymasterRpc,
  SCOPE_URL,
  SEPOLIA_USDC_ADDRESS,
  ZERODEV_DECIMALS,
  ZERODEV_TOKEN_ADDRESS,
} from "@/lib/constants";
import { ZERODEV_TOKEN_ABI } from "@/lib/constants/zeroDevTokenAbi";
import { useMutation } from "@tanstack/react-query";
import { deserializePermissionAccount, serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { CallPolicyVersion, ParamCondition, toCallPolicy, toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import {
  createKernelAccount,
  createKernelAccountClient,
  CreateKernelAccountReturnType,
  createZeroDevPaymasterClient,
  KernelAccountClient,
} from "@zerodev/sdk";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { encodeFunctionData, erc20Abi, http, parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const PermissionsExample = () => {
  const [amount, setAmount] = useState<string>("");
  const [serialisedSessionKey, setSerialisedSessionKey] = useLocalStorage<string | null>("serialisedSessionKey", null);

  const [sessionKernelClient, setSessionKernelClient] = useState<KernelAccountClient | null>(null);
  const [sessionKeyAccount, setSessionKeyAccount] = useState<CreateKernelAccountReturnType | null>(null);
  const {
    kernelAccountClient: masterKernelAccountClient,
    publicClient,
    ecdsaValidator: masterEcdsaValidator,
  } = useAccountWrapperContext();

  const createSessionKey = async () => {
    if (!masterKernelAccountClient?.account) throw new Error("Kernel account client not found");
    if (!publicClient) throw new Error("Public client not found");
    if (!masterEcdsaValidator) throw new Error("ECDSA validator not found");

    let sessionKeyAccount: CreateKernelAccountReturnType;
    if (serialisedSessionKey) {
      sessionKeyAccount = await deserializePermissionAccount(
        publicClient,
        entryPoint,
        kernelVersion,
        serialisedSessionKey,
      );
    } else {
      const _sessionKey = generatePrivateKey();

      const sessionAccount = privateKeyToAccount(_sessionKey as `0x${string}`);

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
                condition: ParamCondition.EQUAL,
                value: masterKernelAccountClient.account.address,
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
        policies: [toSudoPolicy({})],
      });

      sessionKeyAccount = await createKernelAccount(publicClient, {
        entryPoint,
        plugins: {
          sudo: masterEcdsaValidator,
          regular: permissionPlugin,
        },
        kernelVersion: kernelVersion,
      });
    }

    const kernelPaymaster = createZeroDevPaymasterClient({
      chain: chain,
      transport: http(paymasterRpc),
    });
    const kernelClient = createKernelAccountClient({
      account: sessionKeyAccount,
      chain: chain,
      bundlerTransport: http(bundlerRpc),
      paymaster: {
        getPaymasterData(userOperation) {
          return kernelPaymaster.sponsorUserOperation({ userOperation });
        },
      },
    });

    setSerialisedSessionKey(await serializePermissionAccount(sessionKeyAccount));
    setSessionKernelClient(kernelClient);
    setSessionKeyAccount(sessionKeyAccount);
  };

  const {
    mutate: sendTransactionWithAmount,
    isPending,
    data: txHash,
  } = useMutation({
    mutationFn: async () => {
      if (!sessionKernelClient) throw new Error("Kernel client not found");
      if (!masterKernelAccountClient?.account) throw new Error("Kernel account client not found");

      return sessionKernelClient?.sendTransaction({
        calls: [
          {
            to: SEPOLIA_USDC_ADDRESS,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [masterKernelAccountClient.account.address, parseUnits(amount, 18)],
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
            window.open(`${SCOPE_URL}/op/${data}`, "_blank");
          },
        },
      });
    },
    onError: (error) => {
      console.error("Transaction failed", error);
      toast.error("Transaction failed");
    },
  });

  console.log({ kernelClient: sessionKernelClient, sessionKeyAccount });

  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Permissions</h4>

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Create a session key</Badge>

          <Button
            className="h-9"
            onClick={createSessionKey}
          >
            Create
          </Button>

          {/* {kernelClient?.sessionKey && (
            <div className="w-full">
              <p className="text-sm">Session Account</p>
              <p className="truncate text-sm">{kernelClient.sessionKey.address}</p>
            </div>
          )} */}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="h-9 text-sm font-medium">2. Transfer ZDEV</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-sm">This transaction will be rejected if the amount is greater than 10 ZDEV.</p>
        </div>

        <Button
          disabled={isPending}
          onClick={() => sendTransactionWithAmount()}
        >
          {isPending ? "Sending..." : "Send Transaction"}
        </Button>

        {txHash && (
          <a
            href={`${SCOPE_URL}/op/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline underline-offset-4"
          >
            View Destination Transaction
          </a>
        )}
      </div>
    </div>
  );
};

export default PermissionsExample;
