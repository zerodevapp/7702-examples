import { entryPoint, kernelVersion } from "@/lib/constants";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KernelAccountClient } from "@zerodev/sdk";
import React from "react";
import { sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";

const PROVIDER = "dynamic";

const DynamicAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { primaryWallet, user } = useDynamicContext();

  const publicClient = usePublicClient({
    chainId: sepolia.id,
  });

  const { data: kernelAccountClient } = useQuery({
    queryKey: [PROVIDER, "kernelAccountClient", primaryWallet?.address],
    queryFn: async () => {
      if (!primaryWallet) {
        console.log("[DYNAMIC] No primary wallet found");
        return null;
      }

      if (!isZeroDevConnector(primaryWallet.connector)) {
        console.log("[DYNAMIC] Connector is not a ZeroDev connector");
        return null;
      }
      const walletClient = primaryWallet.connector.getWalletClient?.();
      console.log({ walletClient, primaryWallet });

      const connector = primaryWallet.connector;
      const _kernelAccountClient = connector.getAccountAbstractionProvider({
        withSponsorship: true,
      });

      if (!_kernelAccountClient) {
        console.error("[DYNAMIC] Kernel client not found");
        return null;
      }

      return _kernelAccountClient as KernelAccountClient;
    },
  });
  const { data: ecdsaValidator } = useQuery({
    queryKey: [PROVIDER, "ecdsaValidator", primaryWallet?.address],
    queryFn: async () => {
      if (!primaryWallet) {
        console.error("[DYNAMIC] No primary wallet found");
        return null;
      }

      if (!publicClient) {
        console.error("[DYNAMIC] No public client found");
        return null;
      }

      if (!isZeroDevConnector(primaryWallet.connector)) {
        console.error("[DYNAMIC] Connector is not a ZeroDev connector");
        return null;
      }
      const dynamicWalletClient = primaryWallet?.connector?.getWalletClient();

      if (!dynamicWalletClient) {
        console.error("[DYNAMIC] No dynamic wallet client found");
        return null;
      }

      // Pass your `smartAccountSigner` to the validator
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        // @ts-expect-error - type inconsistency
        signer: dynamicWalletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });

      return ecdsaValidator;
    },
  });

  const { data: kernelAccount } = useQuery({
    queryKey: [PROVIDER, "kernelAccount", primaryWallet?.address],
    queryFn: async () => {
      if (!kernelAccountClient) return null;
      return kernelAccountClient.account;
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
    queryKey: [PROVIDER, "isDeployed", kernelAccountClient?.account?.address],
    queryFn: async () => {
      if (!kernelAccountClient?.account) return false;
      return kernelAccountClient.account.isDeployed();
    },
    enabled: !!kernelAccountClient?.account,
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "dynamic",
        login: () => Promise.resolve(),
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        kernelAccount,
        kernelAccountClient,
        ecdsaValidator,
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
