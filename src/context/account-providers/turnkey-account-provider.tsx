import {
  baseSepoliaBundlerRpc,
  baseSepoliaPaymasterRpc,
  entryPoint,
  kernelAddresses,
  kernelVersion,
} from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useTurnkey } from "@turnkey/sdk-react";
import { createAccount } from "@turnkey/viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo } from "react";
import { Account, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";

const PROVIDER = "turnkey";
const TurnkeyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { turnkey, authIframeClient, getActiveClient } = useTurnkey();

  const baseSepoliaPublicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  const baseSepoliaPaymasterClient = useMemo(() => {
    if (!baseSepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(baseSepoliaPaymasterRpc),
    });
  }, [baseSepoliaPublicClient]);

  const getTurnkeySessionData = async () => {
    if (!turnkey || !authIframeClient || !baseSepoliaPublicClient || !baseSepoliaPaymasterClient) {
      return null;
    }

    const session = await turnkey?.getSession();
    if (!session) {
      await turnkey?.logout();
      console.log("[TURNKEY] No session found. Logging out.");
      return null;
    }
    const turnkeyActiveClient = await getActiveClient();
    if (!turnkeyActiveClient) {
      console.log("[TURNKEY] No turnkey client found. Logging out.");
      await turnkey?.logout();
      return null;
    }

    await authIframeClient.injectCredentialBundle(session!.token);

    const suborgId = session?.organizationId;

    const userResponse = await authIframeClient!.getUser({
      organizationId: suborgId!,
      userId: session.userId!,
    });
    const walletsResponse = await authIframeClient!.getWallets({
      organizationId: suborgId!,
    });
    console.log("[TURNKEY] getWallets", walletsResponse);

    let selectedWalletId = null;
    let selectedAccount = null;
    // Default to the first wallet if available
    if (walletsResponse.wallets.length > 0) {
      selectedWalletId = walletsResponse.wallets[0].walletId;
      // setSelectedWallet(defaultWalletId);

      const accountsResponse = await authIframeClient!.getWalletAccounts({
        organizationId: suborgId!,
        walletId: selectedWalletId,
      });
      console.log("[TURNKEY] getWalletAccounts", accountsResponse);

      // setAccounts(accountsResponse.accounts);
      if (accountsResponse.accounts.length > 0) {
        selectedAccount = accountsResponse.accounts.filter(
          (account) => account.addressFormat === "ADDRESS_FORMAT_ETHEREUM",
        )?.[0];
      }
    }

    if (!selectedAccount) return null;

    const embeddedWallet: EmbeddedWallet = {
      provider: "turnkey",
      address: selectedAccount?.address as `0x${string}`,
      user: userResponse.user.userName,
    };

    const viemAccount = await createAccount({
      // @ts-expect-error: type intersection issue
      client: turnkeyActiveClient,
      organizationId: suborgId!,
      signWith: selectedAccount?.address,
      ethereumAddress: selectedAccount?.address,
    });

    const viemWalletClient = createWalletClient({
      account: viemAccount as Account,
      chain: baseSepolia,
      transport: http(),
    });

    const authorization = await viemWalletClient.signAuthorization({
      chainId: baseSepolia.id,
      nonce: 0,
      address: kernelAddresses.accountImplementationAddress,
    });

    const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
      eip7702Account: viemWalletClient,
      entryPoint,
      kernelVersion,
      eip7702Auth: authorization,
    });

    const kernelAccountClient = createKernelAccountClient({
      account: kernelAccount,
      chain: baseSepolia,
      bundlerTransport: http(baseSepoliaBundlerRpc),
      paymaster: baseSepoliaPaymasterClient,
      client: baseSepoliaPublicClient,
    });
    const ecdsaValidator = await signerToEcdsaValidator(baseSepoliaPublicClient, {
      signer: viemWalletClient,
      entryPoint,
      kernelVersion,
    });

    return {
      user: userResponse.user,
      wallets: walletsResponse.wallets,
      selectedWalletId,
      selectedAccount,
      embeddedWallet,
      kernelAccountClient,
      ecdsaValidator,
      viemWalletClient,
    };
  };

  const { data: sessionData, refetch: refetchSessionData } = useQuery({
    queryKey: ["init-turnkey-account-provider"],
    queryFn: getTurnkeySessionData,
    enabled: !!turnkey && !!authIframeClient && !!baseSepoliaPublicClient && !!baseSepoliaPaymasterClient,
  });

  useEffect(() => {
    if (turnkey && authIframeClient) {
      refetchSessionData();
    }
  }, [authIframeClient, turnkey, refetchSessionData]);

  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", sessionData?.kernelAccountClient?.account.address],
    queryFn: async () => {
      if (!sessionData?.kernelAccountClient) return false;
      return sessionData.kernelAccountClient.account.isDeployed();
    },
    enabled: !!sessionData?.kernelAccountClient,
    refetchInterval: ({ state }) => (state.data ? false : 2000),
  });

  return (
    <AccountProviderContext.Provider
      value={{
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
        embeddedWallet: sessionData?.embeddedWallet,
        isDeployed: Boolean(isDeployed),
        login: async () => {
          throw new Error("Not implemented");
        },
        provider: PROVIDER,
        ecdsaValidator: sessionData?.ecdsaValidator,
        intentClient: undefined,
        kernelAccountClient: sessionData?.kernelAccountClient,
        signer: sessionData?.viemWalletClient,
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default TurnkeyAccountProvider;
