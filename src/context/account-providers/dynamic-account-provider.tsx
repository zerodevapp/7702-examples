import { entryPoint, kernelVersion } from "@/lib/constants";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import React from "react";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";

const PROVIDER = "dynamic";

const DynamicAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { primaryWallet, user } = useDynamicContext();

  const publicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  const { data: kernelAccountClients } = useQuery({
    queryKey: [PROVIDER, "kernelAccountClient", primaryWallet?.address],
    queryFn: async () => {
      if (!primaryWallet) return null;
      if (!publicClient) return null;
      if (!isZeroDevConnector(primaryWallet.connector)) {
        throw new Error("[DYNAMIC] Connector is not a ZeroDev connector");
      }
      await primaryWallet.connector.switchNetwork({ networkChainId: baseSepolia.id });

      const walletClient = primaryWallet.connector.getWalletClient?.();

      if (!walletClient) {
        throw new Error("[DYNAMIC] No wallet client found");
      }

      const connector = primaryWallet.connector;
      const _kernelAccountClient = connector.getAccountAbstractionProvider({
        withSponsorship: true,
      });

      if (!_kernelAccountClient) {
        console.error("[DYNAMIC] Kernel client not found");
        return null;
      }

      // Pass your `smartAccountSigner` to the validator
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });

      return { kernelAccountClient: _kernelAccountClient, ecdsaValidator };
    },
  });

  const { data: embeddedWallet } = useQuery<EmbeddedWallet | null>({
    queryKey: [PROVIDER, "embeddedWallet", primaryWallet?.address, user?.email, user?.username],
    queryFn: async () => {
      if (!primaryWallet) return null;
      if (!user) return null;

      return {
        provider: "dynamic",
        address: primaryWallet.address as `0x${string}`,
        user: user.email || user.username || "",
      };
    },
    enabled: !!primaryWallet && !!user,
  });

  // isDeployed
  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", kernelAccountClients?.kernelAccountClient?.account?.address],
    queryFn: async () => {
      if (!kernelAccountClients?.kernelAccountClient?.account) return false;
      return kernelAccountClients.kernelAccountClient.account.isDeployed();
    },
    enabled: !!kernelAccountClients?.kernelAccountClient?.account,
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "dynamic",
        login: () => Promise.resolve(),
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        // @ts-expect-error: dynamic sdk update will fix this
        kernelAccountClient: kernelAccountClients?.kernelAccountClient,
        ecdsaValidator: kernelAccountClients?.ecdsaValidator,
        intentClient: null,
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default DynamicAccountProvider;
