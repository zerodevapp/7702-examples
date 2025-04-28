"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { CreateKernelAccountReturnType, KernelAccountClient } from "@zerodev/sdk";
import React, { createContext, useContext, useMemo, useState } from "react";
import PrivyAccountProvider from "./account-providers/privy-account-provider";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia, sepolia } from "viem/chains";
import { IntentClient } from "@zerodev/intent";

export const accountProviders = ["privy", "dynamic", "turnkey", "browser"] as const;
export type AccountProviders = (typeof accountProviders)[number];

export const AccountProviderContext = createContext<{
  accountProvider: AccountProviders;
  setAccountProvider: (accountProvider: AccountProviders) => void;
  kernelAccountClient: KernelAccountClient | null;
  kernelAccount: CreateKernelAccountReturnType | null;
  setKernelAccountClient: (kernelAccountClient: KernelAccountClient | null) => void;
  setKernelAccount: (kernelAccount: CreateKernelAccountReturnType | null) => void;
  embeddedWallet: EmbeddedWallet | null;
  setEmbeddedWallet: (embeddedWallet: EmbeddedWallet | null) => void;
  intentClient: IntentClient | null;
  setIntentClient: (intentClient: IntentClient | null) => void;
}>({
  accountProvider: "privy",
  setAccountProvider: () => {},
  kernelAccountClient: null,
  kernelAccount: null,
  setKernelAccountClient: () => {},
  setKernelAccount: () => {},
  embeddedWallet: null,
  setEmbeddedWallet: () => {},
  intentClient: null,
  setIntentClient: () => {},
});

type EmbeddedWallet = {
  provider: "privy" | "dynamic" | "turnkey" | "browser";
  address: string;
  user: string;
};

const wagmiConfig = createConfig({
  chains: [sepolia, baseSepolia],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const AccountProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [accountProvider, setAccountProvider] = useState<AccountProviders>("privy");
  const [embeddedWallet, setEmbeddedWallet] = useState<EmbeddedWallet | null>(null);
  const [kernelAccountClient, setKernelAccountClient] = useState<KernelAccountClient | null>(null);
  const [kernelAccount, setKernelAccount] = useState<CreateKernelAccountReturnType | null>(null);
  const [intentClient, setIntentClient] = useState<IntentClient | null>(null);

  const EmbeddedOrInjectedProvider = useMemo(() => {
    if (accountProvider === "privy") {
      const PrivyProviderWrapper = ({ children }: { children: React.ReactNode }) => (
        <WagmiProvider config={wagmiConfig}>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
            config={{
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                showWalletUIs: true,
                createOnLogin: "all-users",
              },
            }}
          >
            <PrivyAccountProvider>{children}</PrivyAccountProvider>
          </PrivyProvider>
        </WagmiProvider>
      );
      return PrivyProviderWrapper;
    }
    // if (accountProvider === "dynamic") {
    //   return DynamicAccountProvider;
    // }
    // if (accountProvider === "turnkey") {
    //   return TurnkeyAccountProvider;
    // }
    // if (accountProvider === "browser") {
    //   return BrowserAccountProvider;
    // }
  }, [accountProvider]);

  if (!EmbeddedOrInjectedProvider) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-2xl font-bold">Invalid account provider selected</div>
      </div>
    );
  }

  return (
    <AccountProviderContext.Provider
      value={{
        accountProvider,
        setAccountProvider,
        kernelAccountClient,
        kernelAccount,
        setKernelAccountClient,
        setKernelAccount,
        embeddedWallet,
        setEmbeddedWallet,
        intentClient,
        setIntentClient,
      }}
    >
      <EmbeddedOrInjectedProvider>{children}</EmbeddedOrInjectedProvider>
    </AccountProviderContext.Provider>
  );
};

export const useAccountWrapperContext = () => {
  return useContext(AccountProviderContext);
};

export default AccountProviderWrapper;
