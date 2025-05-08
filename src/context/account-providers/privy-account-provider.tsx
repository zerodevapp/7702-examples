import {
  baseSepoliaBundlerRpc,
  baseSepoliaPaymasterRpc,
  entryPoint,
  kernelAddresses,
  kernelVersion,
} from "@/lib/constants";
import { useCreateWallet, useLogin, usePrivy, useSignAuthorization, useWallets } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  create7702KernelAccount,
  create7702KernelAccountClient,
  signerToEcdsaValidator,
} from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo } from "react";
import { createWalletClient, custom, Hex, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { AccountProviderContext, EmbeddedWallet } from "./provider-context";
/**
 * Constants for the Privy account provider
 */
const PROVIDER = "privy";

/**
 * PrivyAccountProvider is a React component that manages authentication and wallet functionality
 * using Privy's authentication system. It handles wallet creation, kernel account setup,
 * and provides authentication UI components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} The provider component with authentication functionality
 */
const PrivyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAuthorization } = useSignAuthorization();

  const { login } = useLogin();

  const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const { data: privyAccount } = useQuery({
    queryKey: [PROVIDER, "walletClient", privyEmbeddedWallet?.address],
    queryFn: async () => {
      if (!privyEmbeddedWallet) {
        return null;
      }
      const walletClient = createWalletClient({
        account: privyEmbeddedWallet.address as Hex,
        chain: baseSepolia,
        transport: custom(await privyEmbeddedWallet.getEthereumProvider()),
      });
      return walletClient;
    },
    enabled: !!privyEmbeddedWallet,
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
  const baseSepoliaPaymasterClient = useMemo(() => {
    if (!baseSepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: baseSepolia,
      transport: http(baseSepoliaPaymasterRpc),
    });
  }, [baseSepoliaPublicClient]);

  /**
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: kernelClients } = useQuery({
    queryKey: [
      PROVIDER,
      "kernelClient",
      privyAccount?.account.address,
      baseSepoliaPaymasterClient?.name,
      sepoliaPublicClient?.name,
    ],
    queryFn: async () => {
      if (!privyAccount || !baseSepoliaPublicClient || !baseSepoliaPaymasterClient) return null;

      const ecdsaValidator = await signerToEcdsaValidator(baseSepoliaPublicClient, {
        signer: privyAccount,
        entryPoint,
        kernelVersion,
      });

      const authorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress,
        chainId: baseSepolia.id,
      });

      const kernelAccount = await create7702KernelAccount(baseSepoliaPublicClient, {
        signer: privyAccount,
        entryPoint,
        kernelVersion,
        eip7702Auth: authorization,
      });

      const kernelAccountClient = create7702KernelAccountClient({
        account: kernelAccount,
        chain: baseSepolia,
        bundlerTransport: http(baseSepoliaBundlerRpc),
        paymaster: baseSepoliaPaymasterClient,
        client: baseSepoliaPublicClient,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!baseSepoliaPublicClient && !!privyAccount && !!baseSepoliaPaymasterClient,
  });

  // intent client
  // const { data: intentClient, mutateAsync: createIntentClientMutation } = useMutation({
  //   mutationKey: [PROVIDER, "intentClient", !!sepoliaPublicClient, !!privyAccount, !!baseSepoliaPaymasterClient],
  //   mutationFn: async () => {
  //     if (!baseSepoliaPublicClient) throw new Error("No public client found");
  //     if (!sepoliaPublicClient) throw new Error("No public client found");
  //     if (!privyAccount) throw new Error("No wallet client found");
  //     if (!baseSepoliaPaymasterClient) throw new Error("No paymaster client found");

  //     const sepoliaKernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
  //       signer: privyAccount,
  //       kernelVersion,
  //       entryPoint,
  //     });

  //     const sepoliaKernelAccountClient = create7702KernelAccountClient({
  //       account: sepoliaKernelAccount,
  //       chain: sepolia,
  //       bundlerTransport: http(sepoliaBundlerRpc),
  //       paymaster: sepoliaPaymasterClient,
  //       client: sepoliaPublicClient,
  //     });

  //     // create a kernel account with intent executor plugin
  //     const baseSepoliaKernelAccount = await create7702KernelAccount(baseSepoliaPublicClient, {
  //       signer: privyAccount,
  //       kernelVersion,
  //       entryPoint,
  //     });

  //     const baseSepoliaKernelAccountClient = create7702KernelAccountClient({
  //       account: baseSepoliaKernelAccount,
  //       chain: baseSepolia,
  //       bundlerTransport: http(baseSepoliaBundlerRpc),
  //       paymaster: baseSepoliaPaymasterClient,
  //       client: baseSepoliaPublicClient,
  //     });

  //     // sign authorization
  //     const sepoliaAuthorization = await signAuthorization({
  //       contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
  //       chainId: sepolia.id,
  //     });
  //     const baseSepoliaAuthorization = await signAuthorization({
  //       contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
  //       chainId: baseSepolia.id,
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
  //     const sepoliaValidationConfig = await checkInstallation(sepoliaPublicClient, privyAccount.address);
  //     console.log("sepoliaValidationConfig", sepoliaValidationConfig);
  //     if (sepoliaValidationConfig.hook !== zeroAddress) {
  //       console.log("Validator already installed on sepolia");
  //     } else {
  //       const installSepoliaValidatorPlugin = await installValidator(sepoliaKernelAccountClient, {
  //         validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
  //         validatorData: privyAccount.address,
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

  //     const baseSepoliaValidationConfig = await checkInstallation(baseSepoliaPublicClient, privyAccount.address);
  //     console.log("baseSepoliaValidationConfig", baseSepoliaValidationConfig);
  //     if (baseSepoliaValidationConfig.hook !== zeroAddress) {
  //       console.log("Validator already installed on baseSepolia");
  //     } else {
  //       const installBaseSepoliaValidatorPlugin = await installValidator(baseSepoliaKernelAccountClient, {
  //         validator: MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS,
  //         validatorData: privyAccount.address,
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
  //       chain: sepolia,
  //       bundlerTransport: http(sepoliaBundlerRpc),
  //       version: INTENT_V0_4,
  //       paymaster: baseSepoliaPaymasterClient,
  //     });

  //     return sepoliaIntentClient;
  //   },
  // });

  /**
   * Handles the sign-in process by opening the Privy sign-in modal
   */
  const signIn = async () => {
    // setOpenPrivySignInModal(true);
    login();
  };

  /**
   * Mutation hook for creating a new embedded wallet
   * The mutation object with createEmbeddedWallet function
   */
  const { mutate: createEmbeddedWallet } = useMutation({
    mutationFn: async () => {
      const newEmbeddedWallet = await createWallet();
      return newEmbeddedWallet;
    },
  });

  useEffect(() => {
    if (user) {
      if (!privyEmbeddedWallet) {
        createEmbeddedWallet();
      }
    }
  }, [user, privyEmbeddedWallet, createEmbeddedWallet]);

  const { data: embeddedWallet } = useQuery<EmbeddedWallet | null>({
    queryKey: [PROVIDER, "embeddedWallet", privyEmbeddedWallet?.address, user],
    queryFn: async () => {
      if (!user) return null;
      if (!privyEmbeddedWallet) return null;

      return {
        provider: "privy",
        address: privyEmbeddedWallet.address as `0x${string}`,
        user: user.email?.address ?? user.id,
      };
    },
    enabled: !!privyEmbeddedWallet && !!user,
  });

  const { data: isDeployed } = useQuery({
    queryKey: [PROVIDER, "isDeployed", kernelClients?.kernelAccount.address],
    queryFn: async () => {
      if (!kernelClients) return false;
      return kernelClients.kernelAccount.isDeployed();
    },
    enabled: !!kernelClients?.kernelAccount,
    refetchInterval: ({ state }) => (state.data ? false : 2000),
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "privy",
        login: signIn,
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        kernelAccountClient: kernelClients?.kernelAccountClient,
        ecdsaValidator: kernelClients?.ecdsaValidator,
        intentClient: undefined,
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  );
};

export default PrivyAccountProvider;
