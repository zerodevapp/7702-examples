import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sepoliaBundlerRpc,
  SEPOLIA,
  entryPoint,
  kernelAddresses,
  kernelVersion,
  sepoliaPaymasterRpc,
} from "@/lib/constants";
import {
  useCreateWallet,
  useLogin,
  useLoginWithEmail,
  usePrivy,
  useSignAuthorization,
  useWallets,
} from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createIntentClient, getIntentExecutorPluginData, installIntentExecutor, INTENT_V0_4 } from "@zerodev/intent";
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo, useState } from "react";
import { createWalletClient, custom, Hex, http, zeroAddress } from "viem";
import { usePublicClient } from "wagmi";
import {
  AccountProviderContext,
  EmbeddedWallet,
  SendTransactionParameters,
  SendUserOperationParameters,
} from "./provider-context";
import { baseSepolia } from "viem/chains";

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
  const [openPrivySignInModal, setOpenPrivySignInModal] = useState(false);
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAuthorization } = useSignAuthorization();

  const { login } = useLogin();

  const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  const { data: ethereumProvider } = useQuery({
    queryKey: [PROVIDER, "ethereumProvider", !!privyEmbeddedWallet],
    queryFn: async () => {
      if (!privyEmbeddedWallet) return null;
      return await privyEmbeddedWallet.getEthereumProvider();
    },
    enabled: !!privyEmbeddedWallet,
  });

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const walletClient = useMemo(() => {
    if (!ethereumProvider || !privyEmbeddedWallet) {
      return null;
    }
    return createWalletClient({
      account: privyEmbeddedWallet.address as Hex,
      chain: SEPOLIA,
      transport: custom(ethereumProvider),
    });
  }, [privyEmbeddedWallet, ethereumProvider]);

  /**
   * Creates a public client for blockchain interactions
   * The configured public client or null if wallet client is not available
   */
  const sepoliaPublicClient = usePublicClient({
    chainId: SEPOLIA.id,
  });
  const basePublicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  /**
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: ecdsaValidator } = useQuery({
    queryKey: [PROVIDER, "ecdsaValidator", !!sepoliaPublicClient, !!walletClient],
    queryFn: async () => {
      if (!walletClient || !sepoliaPublicClient) return null;

      return signerToEcdsaValidator(sepoliaPublicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });
    },
    enabled: !!sepoliaPublicClient && !!walletClient,
  });

  // const { data: webAuthnKey } = useQuery({
  //   queryKey: ["webAuthnKey"],
  //   queryFn: async () => {
  //     return await toWebAuthnKey({
  //       passkeyName: "7702 Examples Passkey",
  //       passkeyServerUrl: "https://passkeys.zerodev.app/api/v3/fefe0be1-b3db-4eff-bbb7-750485bd732c",
  //       mode: WebAuthnMode.Register,
  //       passkeyServerHeaders: {},
  //     });
  //   },
  // });

  // const { data: passkeyValidator } = useQuery({
  //   queryKey: ["passkeyValidator"],
  //   queryFn: async () => {
  //     if (!webAuthnKey) return null;
  //     if (!publicClient) return null;

  //     return await toPasskeyValidator(publicClient, {
  //       webAuthnKey,
  //       entryPoint: entryPoint,
  //       kernelVersion: kernelVersion,
  //       validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
  //     });
  //   },
  //   enabled: !!webAuthnKey && !!publicClient,
  // });

  /**
   * Creates a kernel account using the ECDSA validator
   * The configured kernel account or null if prerequisites are not met
   */
  const { data: kernelAccount } = useQuery({
    queryKey: [PROVIDER, "kernel-account", !!sepoliaPublicClient, !!walletClient, !!ecdsaValidator],
    queryFn: async () => {
      if (!sepoliaPublicClient) return null;

      const authorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: SEPOLIA.id,
      });

      return createKernelAccount(sepoliaPublicClient, {
        plugins: {
          sudo: ecdsaValidator!,
        },
        entryPoint,
        kernelVersion,
        address: walletClient!.account.address,
        eip7702Auth: authorization,
        initConfig: [installIntentExecutor(INTENT_V0_4)],
        pluginMigrations: [getIntentExecutorPluginData(INTENT_V0_4)],
      });
    },
    enabled: !!sepoliaPublicClient && !!walletClient && !!ecdsaValidator,
    retry: false,
  });

  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const sepoliaPaymasterClient = useMemo(() => {
    if (!sepoliaPublicClient) return null;
    return createZeroDevPaymasterClient({
      chain: SEPOLIA,
      transport: http(sepoliaPaymasterRpc),
    });
  }, [sepoliaPublicClient]);

  /**
   * Creates a kernel account client for interacting with the kernel account
   * The configured kernel account client or null if prerequisites are not met
   */
  const kernelAccountClient = useMemo(() => {
    if (!sepoliaPublicClient || !kernelAccount || !sepoliaPaymasterClient) return null;
    return createKernelAccountClient({
      account: kernelAccount,
      chain: SEPOLIA,
      bundlerTransport: http(sepoliaBundlerRpc),
      paymaster: sepoliaPaymasterClient,
      client: sepoliaPublicClient,
    });
    // TODO: send empty userops on both chains (base, sepolia)
    // for installing the intent executor plugin
  }, [sepoliaPublicClient, kernelAccount, sepoliaPaymasterClient]);

  // intent client
  const { data: intentClient, mutateAsync: createIntentClientMutation } = useMutation({
    mutationKey: [
      PROVIDER,
      "intentClient",
      !!sepoliaPublicClient,
      !!walletClient,
      !!ecdsaValidator,
      !!sepoliaPaymasterClient,
    ],
    mutationFn: async () => {
      if (!basePublicClient) throw new Error("No public client found");
      if (!sepoliaPublicClient) throw new Error("No public client found");
      if (!walletClient) throw new Error("No wallet client found");
      if (!sepoliaPaymasterClient) throw new Error("No paymaster client found");
      const ecdsaValidator = await toMultiChainECDSAValidator(sepoliaPublicClient, {
        signer: walletClient,
        kernelVersion,
        entryPoint,
        multiChainIds: [SEPOLIA.id, baseSepolia.id],
      });

      const sepoliaAuthorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: SEPOLIA.id,
      });

      // create a kernel account with intent executor plugin
      const sepoliaKernelAccount = await createKernelAccount(sepoliaPublicClient, {
        address: walletClient!.account.address,
        plugins: {
          sudo: ecdsaValidator,
        },
        kernelVersion,
        entryPoint,
        initConfig: [installIntentExecutor(INTENT_V0_4)],
        // pluginMigrations: [getIntentExecutorPluginData(INTENT_V0_4)],
        eip7702Auth: sepoliaAuthorization,
      });

      // the cabclient can be used to send normal userOp and cross-chain cab tx
      const sepoliaIntentClient = createIntentClient({
        account: sepoliaKernelAccount,
        chain: SEPOLIA,
        bundlerTransport: http(sepoliaBundlerRpc),
        version: INTENT_V0_4,
        paymaster: sepoliaPaymasterClient,
      });

      await sepoliaIntentClient
        .sendTransaction({
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
        })
        .then(() => {
          console.log("installed intent executor plugin on sepolia");
        })
        .catch((error) => {
          console.error("error installing intent executor plugin on sepolia", error);
          throw new Error("Error installing intent executor plugin on sepolia");
        });

      // const baseSepoliaPaymasterClient = createZeroDevPaymasterClient({
      //   chain: baseSepolia,
      //   transport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
      // });
      // const baseSepoliaAuthorization = await signAuthorization({
      //   contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
      //   chainId: baseSepolia.id,
      // });
      // // create a kernel account with intent executor plugin
      // const baseSepoliaKernelAccount = await createKernelAccount(basePublicClient, {
      //   address: walletClient!.account.address,
      //   plugins: {
      //     sudo: ecdsaValidator,
      //   },
      //   kernelVersion,
      //   entryPoint,
      //   initConfig: [installIntentExecutor(INTENT_V0_4)],
      //   eip7702Auth: baseSepoliaAuthorization,
      //   pluginMigrations: [getIntentExecutorPluginData(INTENT_V0_4)],
      // });

      // // create sepolia and base sepolia intent clients
      // const baseSepoliaIntentClient = createIntentClient({
      //   account: baseSepoliaKernelAccount,
      //   chain: baseSepolia,
      //   bundlerTransport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
      //   version: INTENT_V0_4,
      //   paymaster: baseSepoliaPaymasterClient,
      // });

      // console.log("baseSepoliaIntentClient", baseSepoliaIntentClient.account.address);
      // console.log("sepoliaIntentClient", sepoliaIntentClient.account.address);

      // empty userop to install the intent executor plugin
      // await baseSepoliaIntentClient
      //   .sendTransaction({
      //     to: zeroAddress,
      //     value: BigInt(0),
      //     data: "0x",
      //   })
      //   .then(() => {
      //     console.log("installed intent executor plugin on baseSepolia");
      //   })
      //   .catch((error) => {
      //     console.error("error installing intent executor plugin on baseSepolia", error);
      //     throw new Error("Error installing intent executor plugin on baseSepolia");
      //   });
      // return baseSepoliaIntentClient;

      return sepoliaIntentClient;
    },
  });

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

  const { mutateAsync: sendUserOperation } = useMutation({
    mutationKey: [PROVIDER, "sendUserOperation"],
    mutationFn: async ({ userOperation }: { userOperation: SendUserOperationParameters }) => {
      if (!kernelAccountClient) throw new Error("No kernel account client found");
      return kernelAccountClient.sendUserOperation(userOperation);
    },
  });

  const { mutateAsync: sendTransaction } = useMutation({
    mutationKey: [PROVIDER, "sendTransaction"],
    mutationFn: async ({ transaction }: { transaction: SendTransactionParameters }) => {
      if (!kernelAccountClient) throw new Error("No kernel account client found");
      return kernelAccountClient.sendTransaction(transaction);
    },
  });

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
    queryKey: [PROVIDER, "isDeployed", kernelAccountClient?.account.address],
    queryFn: async () => {
      if (!kernelAccountClient) return false;
      return kernelAccountClient.account.isDeployed();
    },
    enabled: !!kernelAccountClient?.account,
  });

  return (
    <AccountProviderContext.Provider
      value={{
        provider: "privy",
        sendUserOperationMutation: sendUserOperation,
        sendTransactionMutation: sendTransaction,
        login: signIn,
        embeddedWallet,
        isDeployed: Boolean(isDeployed),
        kernelAccountClient,
        kernelAccount,
        ecdsaValidator,
        intentClient,
        createIntentClient: createIntentClientMutation,
      }}
    >
      <PrivySignInModal
        openPrivySignInModal={openPrivySignInModal}
        setOpenPrivySignInModal={setOpenPrivySignInModal}
      />
      {children}
    </AccountProviderContext.Provider>
  );
};

/**
 * PrivySignInModal is a component that handles the email-based authentication flow
 * using Privy's authentication system.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.openPrivySignInModal - Controls the visibility of the modal
 * @param {Function} props.setOpenPrivySignInModal - Function to update modal visibility
 * @returns {JSX.Element} The sign-in modal component
 */
const PrivySignInModal = ({
  openPrivySignInModal,
  setOpenPrivySignInModal,
}: {
  openPrivySignInModal: boolean;
  setOpenPrivySignInModal: (open: boolean) => void;
}) => {
  const { sendCode, loginWithCode, state } = useLoginWithEmail();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (state.status === "done") {
      setOpenPrivySignInModal(false);
      setEmail("");
      setCode("");
    }
  }, [state, setOpenPrivySignInModal]);

  return (
    <Dialog
      open={openPrivySignInModal}
      onOpenChange={setOpenPrivySignInModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in with Privy</DialogTitle>
        </DialogHeader>
        {state.status === "initial" ? (
          <>
            <Label>Enter your email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={() => sendCode({ email })}>Send code</Button>
          </>
        ) : state.status === "awaiting-code-input" ? (
          <>
            <Label>Enter the code sent to your email</Label>
            <Input
              type="text"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={() => loginWithCode({ code })}>Login</Button>
          </>
        ) : state.status === "submitting-code" ? (
          <>
            <p>Submitting code...</p>
          </>
        ) : (
          <>Loading...</>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrivyAccountProvider;
