"use client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { PrivyProvider } from "@privy-io/react-auth";
import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { baseSepolia, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import DynamicAccountProvider from "./account-providers/dynamic-account-provider";
import PrivyAccountProvider from "./account-providers/privy-account-provider";
import { AccountProviders } from "./account-providers/provider-context";

export const AccountProviderContext = createContext<{
  accountProvider: AccountProviders;
  setAccountProvider: (accountProvider: AccountProviders) => void;
}>({
  accountProvider: "privy",
  setAccountProvider: () => {},
});

const wagmiConfig = createConfig({
  chains: [sepolia, baseSepolia],
  transports: {
    [sepolia.id]: http("https://0xrpc.io/sep"),
    [baseSepolia.id]: http(),
  },
});

const AccountProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [accountProvider, setAccountProvider] = useLocalStorage<AccountProviders>("accountProvider", "privy");

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
    if (accountProvider === "dynamic") {
      const DynamProviderWrapper = ({ children }: { children: React.ReactNode }) => (
        <DynamicContextProvider
          settings={{
            // Find your environment id at https://app.dynamic.xyz/dashboard/developer
            environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
            walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
          }}
        >
          <WagmiProvider config={wagmiConfig}>
            <DynamicWagmiConnector>
              <DynamicAccountProvider>{children}</DynamicAccountProvider>
            </DynamicWagmiConnector>
          </WagmiProvider>
        </DynamicContextProvider>
      );
      return DynamProviderWrapper;
    }
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
