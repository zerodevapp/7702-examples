"use client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import React, { createContext, useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";
export const accountProviders = ["privy", "dynamic", "turnkey", "browser"] as const;
export type AccountProvider = (typeof accountProviders)[number];

export const AccountProviderContext = createContext<{
  accountProvider: AccountProvider;
  setAccountProvider: (accountProvider: AccountProvider) => void;
}>({
  accountProvider: "privy",
  setAccountProvider: () => {},
});

export const publicClient = createPublicClient({
  // Use your own RPC provider (e.g. Infura/Alchemy).
  transport: http("https://1rpc.io/sepolia"),
  chain: sepolia,
});

const config = createConfig({
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http("https://1rpc.io/sepolia"),
  },
});

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [accountProvider, setAccountProvider] = useState<AccountProvider>("privy");

  return (
    <AccountProviderContext.Provider value={{ accountProvider, setAccountProvider }}>
      <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: "34d0eb46-cdfe-426d-920a-c6471127faaf",
          walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
        }}
      >
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </AccountProviderContext.Provider>
  );
};
