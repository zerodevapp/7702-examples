"use client";
import { IntentClient } from "@zerodev/intent";
import { CreateKernelAccountReturnType, KernelAccountClient, KernelValidator } from "@zerodev/sdk";
import { createContext, useContext } from "react";
import { SmartAccount, SendUserOperationParameters as ViemSendUserOperationParameters } from "viem/account-abstraction";
import { sendTransaction } from "viem/actions";

export type SendTransactionParameters = Parameters<typeof sendTransaction>[1];
export type SendUserOperationParameters = ViemSendUserOperationParameters;

export const accountProviders = ["privy", "dynamic", "turnkey", "browser"] as const;
export type AccountProviders = (typeof accountProviders)[number];

export type EmbeddedWallet = {
  provider: AccountProviders;
  address: `0x${string}`;
  user: string;
};

export interface AccountProviderContextInterface {
  provider: AccountProviders;
  embeddedWallet: EmbeddedWallet | undefined | null;
  isDeployed: boolean;
  sendUserOperationMutation: ({
    userOperation,
  }: {
    userOperation: SendUserOperationParameters;
  }) => Promise<`0x${string}`>;
  sendTransactionMutation: ({ transaction }: { transaction: SendTransactionParameters }) => Promise<`0x${string}`>;
  login: () => Promise<void>;
  kernelAccountClient: KernelAccountClient | undefined | null;
  kernelAccount: CreateKernelAccountReturnType | SmartAccount | undefined | null;
  ecdsaValidator: KernelValidator<"ECDSAValidator"> | undefined | null;
  intentClient: IntentClient | undefined | null;
  createIntentClient: () => Promise<IntentClient>;
}

export const AccountProviderContext = createContext<AccountProviderContextInterface>({
  provider:
    typeof window === "undefined" ? "privy" : (window?.localStorage?.getItem("accountProvider") as AccountProviders),
  embeddedWallet: undefined,
  isDeployed: false,
  sendUserOperationMutation: async ({ userOperation }: { userOperation: SendUserOperationParameters }) => {
    console.log(userOperation);
    throw new Error("Not implemented");
  },
  sendTransactionMutation: async ({ transaction }: { transaction: SendTransactionParameters }) => {
    console.log(transaction);
    throw new Error("Not implemented");
  },
  login: async () => {
    throw new Error("Not implemented");
  },
  kernelAccountClient: undefined,
  kernelAccount: undefined,
  ecdsaValidator: undefined,
  intentClient: undefined,
  createIntentClient: async () => {
    throw new Error("Not implemented");
  },
});

export const useAccountProviderContext = () => {
  return useContext(AccountProviderContext);
};
