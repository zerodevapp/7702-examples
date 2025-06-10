import {
  baseSepoliaBundlerRpc,
  baseSepoliaPaymasterRpc,
  entryPoint,
  kernelAddresses,
  kernelVersion,
} from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { http, PrivateKeyAccount } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
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
  const baseSepoliaPublicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const baseSepoliaPaymasterClient = useMemo(() => {
    if (!baseSepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(baseSepoliaPaymasterRpc),
    });
  }, [baseSepoliaPublicClient]);

  const { data: kernelClients } = useQuery({
    queryKey: [
      PROVIDER,
      "kernelClient",
      account?.address,
      baseSepoliaPaymasterClient?.name,
      baseSepoliaPublicClient?.name,
    ],
    queryFn: async () => {
      if (!baseSepoliaPublicClient || !baseSepoliaPaymasterClient) return null;
      if (!account) return null;

      const authorization = await account.signAuthorization({
        chainId: baseSepolia.id,
        nonce: 0,
        address: kernelAddresses.accountImplementationAddress,
      });

      const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
        eip7702Account: account,
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
        signer: account,
        entryPoint,
        kernelVersion,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!baseSepoliaPublicClient && !!account && !!baseSepoliaPaymasterClient,
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

  // const { data: intentClient, mutateAsync: createIntentClientMutation } = useMutation({
  //   mutationKey: [PROVIDER, "intentClient", !!baseSepoliaPublicClient, !!account, !!baseSepoliaPaymasterClient],
  //   mutationFn: async () => {
  //     if (!sepoliaPublicClient) throw new Error("No public client found");
  //     if (!baseSepoliaPublicClient) throw new Error("No public client found");
  //     if (!account) throw new Error("No wallet client found");
  //     if (!baseSepoliaPaymasterClient) throw new Error("No paymaster client found");

  //     const sepoliaKernelAccount = await create7702KernelAccount(baseSepoliaPublicClient, {
  //       signer: account,
  //       kernelVersion,
  //       entryPoint,
  //     });

  //     const sepoliaKernelAccountClient = create7702KernelAccountClient({
  //       account: sepoliaKernelAccount,
  //       chain: baseSepolia,
  //       bundlerTransport: http(sepoliaBundlerRpc),
  //       paymaster: baseSepoliaPaymasterClient,
  //       client: baseSepoliaPublicClient,
  //     });

  //     const basebaseSepoliaPaymasterClient = createZeroDevPaymasterClient({
  //       chain: sepolia,
  //       transport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${sepolia.id}`),
  //     });

  //     // create a kernel account with intent executor plugin
  //     const baseSepoliaKernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
  //       signer: account,
  //       kernelVersion,
  //       entryPoint,
  //     });

  //     const baseSepoliaKernelAccountClient = create7702KernelAccountClient({
  //       account: baseSepoliaKernelAccount,
  //       chain: sepolia,
  //       bundlerTransport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${sepolia.id}`),
  //       paymaster: basebaseSepoliaPaymasterClient,
  //       client: sepoliaPublicClient,
  //     });

  //     // sign authorization
  //     const sepoliaAuthorization = await account.signAuthorization({
  //       contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
  //       chainId: baseSepolia.id,
  //       nonce: 0,
  //     });
  //     const baseSepoliaAuthorization = await account.signAuthorization({
  //       contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
  //       chainId: sepolia.id,
  //       nonce: 0,
  //     });

  //     toast.info("Installing intent executor plugins...");
  //     const installSepoliaIntentPlugin = await installExecutor(sepoliaKernelAccountClient, {
  //       executor: IntentVersionToAddressesMap[INTENT_V0_4].intentExecutorAddress,
  //       account: sepoliaKernelAccount,
  //       authorization: sepoliaAuthorization,
  //     })
  //       .then((tx) => {
  //         console.log("installed intent executor plugin on sepolia");
  //         toast.success("Installed intent executor plugin on Sepolia");
  //         return tx;
  //       })
  //       .catch((error) => {
  //         console.error("error installing intent executor plugin on sepolia", error);
  //         toast.error("Error installing intent executor plugin on Sepolia");
  //         return null;
  //       });
  //     const installBaseSepoliaIntentPlugin = await installExecutor(baseSepoliaKernelAccountClient, {
  //       executor: IntentVersionToAddressesMap[INTENT_V0_4].intentExecutorAddress,
  //       account: baseSepoliaKernelAccount,
  //       authorization: baseSepoliaAuthorization,
  //     })
  //       .then((tx) => {
  //         console.log("installed intent executor plugin on baseSepolia");
  //         toast.success("Installed intent executor plugin on Base Sepolia");
  //         return tx;
  //       })
  //       .catch((error) => {
  //         console.error("error installing intent executor plugin on baseSepolia", error);
  //         toast.error("Error installing intent executor plugin on Base Sepolia");
  //         return null;
  //       });

  //     if (!installSepoliaIntentPlugin || !installBaseSepoliaIntentPlugin) {
  //       throw new Error("Error installing intent executor plugins");
  //     }
  //     console.log("installSepoliaIntentPlugin", installSepoliaIntentPlugin);
  //     console.log("installBaseSepoliaIntentPlugin", installBaseSepoliaIntentPlugin);

  //     console.log("Installing validator plugins...");
  //     const sepoliaValidationConfig = await checkInstallation(baseSepoliaPublicClient, account.address);
  //     console.log("sepoliaValidationConfig", sepoliaValidationConfig);
  //     if (sepoliaValidationConfig.hook !== zeroAddress) {
  //       console.log("Validator already installed on sepolia");
  //     } else {
  //       const installSepoliaValidatorPlugin = await installValidator(sepoliaKernelAccountClient, {
  //         validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
  //         validatorData: account.address,
  //         account: sepoliaKernelAccount,
  //       })
  //         .then((tx) => {
  //           console.log("installed validator plugin on sepolia");
  //           toast.success("Installed validator plugin on Sepolia");
  //           return tx;
  //         })
  //         .catch((error) => {
  //           console.error("error installing validator plugin on sepolia", error);
  //           toast.error("Error installing validator plugin on Sepolia");
  //           return null;
  //         });
  //       console.log("installSepoliaValidatorPlugin", installSepoliaValidatorPlugin);
  //     }

  //     const baseSepoliaValidationConfig = await checkInstallation(sepoliaPublicClient, account.address);
  //     console.log("baseSepoliaValidationConfig", baseSepoliaValidationConfig);
  //     if (baseSepoliaValidationConfig.hook !== zeroAddress) {
  //       console.log("Validator already installed on baseSepolia");
  //     } else {
  //       const installBaseSepoliaValidatorPlugin = await installValidator(baseSepoliaKernelAccountClient, {
  //         validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
  //         validatorData: account.address,
  //         account: baseSepoliaKernelAccount,
  //       })
  //         .then((tx) => {
  //           console.log("installed validator plugin on baseSepolia");
  //           toast.success("Installed validator plugin on Base Sepolia");
  //           return tx;
  //         })
  //         .catch((error) => {
  //           console.error("error installing validator plugin on baseSepolia", error);
  //           toast.error("Error installing validator plugin on Base Sepolia");
  //           return null;
  //         });
  //       console.log("installBaseSepoliaValidatorPlugin", installBaseSepoliaValidatorPlugin);
  //     }

  //     // the cabclient can be used to send normal userOp and cross-chain cab tx
  //     const sepoliaIntentClient = createIntentClient({
  //       account: sepoliaKernelAccount,
  //       chain: baseSepolia,
  //       bundlerTransport: http(sepoliaBundlerRpc),
  //       version: INTENT_V0_4,
  //       paymaster: baseSepoliaPaymasterClient,
  //     });

  //     return sepoliaIntentClient;
  //   },
  // });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "local",
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        login: signIn,
        kernelAccountClient: kernelClients?.kernelAccountClient,
        ecdsaValidator: kernelClients?.ecdsaValidator,
        intentClient: undefined,
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
        signer: account,
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default LocalAccountProvider;
