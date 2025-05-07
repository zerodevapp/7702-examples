import {
  entryPoint,
  kernelAddresses,
  kernelVersion,
  PROJECT_ID,
  sepoliaBundlerRpc,
  sepoliaPaymasterRpc,
} from "@/lib/constants";
import { checkInstallation } from "@/lib/intent/checkInstallation";
import { installExecutor, installValidator } from "@/lib/intent/install";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  create7702KernelAccount,
  create7702KernelAccountClient,
  signerToEcdsaValidator,
} from "@zerodev/ecdsa-validator";
import { createIntentClient, INTENT_V0_4, IntentVersionToAddressesMap } from "@zerodev/intent";
import { MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS } from "@zerodev/multi-chain-ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { http, PrivateKeyAccount, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia, sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";

const PROVIDER = "local";

const LocalAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [localPrivateKey, setLocalPrivateKey] = useLocalStorage("local-account-private-key", "");
  const [account, setAccount] = useState<PrivateKeyAccount | null>(null);

  const createAccount = useCallback(async () => {
    const newPrivateKey = generatePrivateKey();
    const newAccount = privateKeyToAccount(newPrivateKey as `0x${string}`);
    setLocalPrivateKey(newPrivateKey);
    setAccount(newAccount);
  }, [setLocalPrivateKey]);

  useEffect(() => {
    if (localPrivateKey) {
      setAccount(privateKeyToAccount(localPrivateKey as `0x${string}`));
    }
  }, [localPrivateKey, setLocalPrivateKey, createAccount]);

  const { data: embeddedWallet } = useQuery<EmbeddedWallet | null>({
    queryKey: [PROVIDER, "embeddedWallet", account?.address],
    queryFn: async () => {
      if (!account) return null;

      return {
        provider: "local",
        address: account.address as `0x${string}`,
        user: account.address,
      };
    },
    enabled: !!account,
  });

  /**
   * Creates a public client for blockchain interactions
   * The configured public client or null if wallet client is not available
   */
  const sepoliaPublicClient = usePublicClient({
    chainId: sepolia.id,
  });
  const baseSepoliaPublicClient = usePublicClient({
    chainId: baseSepolia.id,
  });
  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const sepoliaPaymasterClient = useMemo(() => {
    if (!sepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: sepolia,
      transport: http(sepoliaPaymasterRpc),
    });
  }, [sepoliaPublicClient]);

  const { data: kernelClients } = useQuery({
    queryKey: [PROVIDER, "kernelClient", account?.address, sepoliaPaymasterClient?.name, sepoliaPublicClient?.name],
    queryFn: async () => {
      if (!sepoliaPublicClient || !sepoliaPaymasterClient) return null;
      if (!account) return null;

      const kernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
        signer: account,
        entryPoint,
        kernelVersion,
      });

      const kernelAccountClient = create7702KernelAccountClient({
        account: kernelAccount,
        chain: sepolia,
        bundlerTransport: http(sepoliaBundlerRpc),
        paymaster: sepoliaPaymasterClient,
        client: sepoliaPublicClient,
      });

      const ecdsaValidator = await signerToEcdsaValidator(sepoliaPublicClient, {
        signer: account,
        entryPoint,
        kernelVersion,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!sepoliaPublicClient && !!account && !!sepoliaPaymasterClient,
  });

  /**
   * Handles the sign-in process by opening the Privy sign-in modal
   */
  const signIn = async () => {
    // setOpenPrivySignInModal(true);
    createAccount();
  };

  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", kernelClients?.kernelAccount.address],
    queryFn: async () => {
      if (!kernelClients) return false;
      return kernelClients.kernelAccount.isDeployed();
    },
    enabled: !!kernelClients?.kernelAccount,
    refetchInterval: ({ state }) => (state.data ? false : 2000),
  });

  const { data: intentClient, mutateAsync: createIntentClientMutation } = useMutation({
    mutationKey: [PROVIDER, "intentClient", !!sepoliaPublicClient, !!account, !!sepoliaPaymasterClient],
    mutationFn: async () => {
      if (!baseSepoliaPublicClient) throw new Error("No public client found");
      if (!sepoliaPublicClient) throw new Error("No public client found");
      if (!account) throw new Error("No wallet client found");
      if (!sepoliaPaymasterClient) throw new Error("No paymaster client found");

      const sepoliaKernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
        signer: account,
        kernelVersion,
        entryPoint,
      });

      const sepoliaKernelAccountClient = create7702KernelAccountClient({
        account: sepoliaKernelAccount,
        chain: sepolia,
        bundlerTransport: http(sepoliaBundlerRpc),
        paymaster: sepoliaPaymasterClient,
        client: sepoliaPublicClient,
      });

      const baseSepoliaPaymasterClient = createZeroDevPaymasterClient({
        chain: baseSepolia,
        transport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
      });

      // create a kernel account with intent executor plugin
      const baseSepoliaKernelAccount = await create7702KernelAccount(baseSepoliaPublicClient, {
        signer: account,
        kernelVersion,
        entryPoint,
      });

      const baseSepoliaKernelAccountClient = create7702KernelAccountClient({
        account: baseSepoliaKernelAccount,
        chain: baseSepolia,
        bundlerTransport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
        paymaster: baseSepoliaPaymasterClient,
        client: baseSepoliaPublicClient,
      });

      // sign authorization
      const sepoliaAuthorization = await account.signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: sepolia.id,
        nonce: 0,
      });
      const baseSepoliaAuthorization = await account.signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: baseSepolia.id,
        nonce: 0,
      });

      toast.info("Installing intent executor plugins...");
      const installSepoliaIntentPlugin = await installExecutor(sepoliaKernelAccountClient, {
        executor: IntentVersionToAddressesMap[INTENT_V0_4].intentExecutorAddress,
        account: sepoliaKernelAccount,
        authorization: sepoliaAuthorization,
      })
        .then((tx) => {
          console.log("installed intent executor plugin on sepolia");
          toast.success("Installed intent executor plugin on Sepolia");
          return tx;
        })
        .catch((error) => {
          console.error("error installing intent executor plugin on sepolia", error);
          toast.error("Error installing intent executor plugin on Sepolia");
          return null;
        });
      const installBaseSepoliaIntentPlugin = await installExecutor(baseSepoliaKernelAccountClient, {
        executor: IntentVersionToAddressesMap[INTENT_V0_4].intentExecutorAddress,
        account: baseSepoliaKernelAccount,
        authorization: baseSepoliaAuthorization,
      })
        .then((tx) => {
          console.log("installed intent executor plugin on baseSepolia");
          toast.success("Installed intent executor plugin on Base Sepolia");
          return tx;
        })
        .catch((error) => {
          console.error("error installing intent executor plugin on baseSepolia", error);
          toast.error("Error installing intent executor plugin on Base Sepolia");
          return null;
        });

      if (!installSepoliaIntentPlugin || !installBaseSepoliaIntentPlugin) {
        throw new Error("Error installing intent executor plugins");
      }
      console.log("installSepoliaIntentPlugin", installSepoliaIntentPlugin);
      console.log("installBaseSepoliaIntentPlugin", installBaseSepoliaIntentPlugin);

      console.log("Installing validator plugins...");
      const sepoliaValidationConfig = await checkInstallation(sepoliaPublicClient, account.address);
      console.log("sepoliaValidationConfig", sepoliaValidationConfig);
      if (sepoliaValidationConfig.hook !== zeroAddress) {
        console.log("Validator already installed on sepolia");
      } else {
        const installSepoliaValidatorPlugin = await installValidator(sepoliaKernelAccountClient, {
          validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
          validatorData: account.address,
          account: sepoliaKernelAccount,
        })
          .then((tx) => {
            console.log("installed validator plugin on sepolia");
            toast.success("Installed validator plugin on Sepolia");
            return tx;
          })
          .catch((error) => {
            console.error("error installing validator plugin on sepolia", error);
            toast.error("Error installing validator plugin on Sepolia");
            return null;
          });
        console.log("installSepoliaValidatorPlugin", installSepoliaValidatorPlugin);
      }

      const baseSepoliaValidationConfig = await checkInstallation(baseSepoliaPublicClient, account.address);
      console.log("baseSepoliaValidationConfig", baseSepoliaValidationConfig);
      if (baseSepoliaValidationConfig.hook !== zeroAddress) {
        console.log("Validator already installed on baseSepolia");
      } else {
        const installBaseSepoliaValidatorPlugin = await installValidator(baseSepoliaKernelAccountClient, {
          validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
          validatorData: account.address,
          account: baseSepoliaKernelAccount,
        })
          .then((tx) => {
            console.log("installed validator plugin on baseSepolia");
            toast.success("Installed validator plugin on Base Sepolia");
            return tx;
          })
          .catch((error) => {
            console.error("error installing validator plugin on baseSepolia", error);
            toast.error("Error installing validator plugin on Base Sepolia");
            return null;
          });
        console.log("installBaseSepoliaValidatorPlugin", installBaseSepoliaValidatorPlugin);
      }

      // the cabclient can be used to send normal userOp and cross-chain cab tx
      const sepoliaIntentClient = createIntentClient({
        account: sepoliaKernelAccount,
        chain: sepolia,
        bundlerTransport: http(sepoliaBundlerRpc),
        version: INTENT_V0_4,
        paymaster: sepoliaPaymasterClient,
      });

      return sepoliaIntentClient;
    },
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "local",
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        login: signIn,
        kernelAccountClient: kernelClients?.kernelAccountClient,
        kernelAccount: kernelClients?.kernelAccount,
        ecdsaValidator: kernelClients?.ecdsaValidator,
        intentClient: intentClient,
        createIntentClient: createIntentClientMutation,
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default LocalAccountProvider;
