import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  entryPoint,
  kernelAddresses,
  kernelVersion,
  PROJECT_ID,
  SEPOLIA,
  sepoliaBundlerRpc,
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
import {
  create7702KernelAccount,
  create7702KernelAccountClient,
  signerToEcdsaValidator,
} from "@zerodev/ecdsa-validator";
import { createIntentClient, installIntentExecutor, INTENT_V0_4 } from "@zerodev/intent";
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-ecdsa-validator";
import { createKernelAccount, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Address, createWalletClient, custom, Hex, http, TypedData, TypedDataDefinition, zeroAddress } from "viem";
import { toAccount } from "viem/accounts";
import { signMessage, signTypedData } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import {
  AccountProviderContext,
  EmbeddedWallet,
  SendTransactionParameters,
  SendUserOperationParameters,
} from "./provider-context";
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

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const { data: walletClient } = useQuery({
    queryKey: [PROVIDER, "walletClient", privyEmbeddedWallet?.address],
    queryFn: async () => {
      if (!privyEmbeddedWallet) {
        return null;
      }
      return createWalletClient({
        account: privyEmbeddedWallet.address as Hex,
        chain: SEPOLIA,
        transport: custom(await privyEmbeddedWallet.getEthereumProvider()),
      });
    },
    enabled: !!privyEmbeddedWallet,
  });

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
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: kernelClients } = useQuery({
    queryKey: [
      PROVIDER,
      "kernelClient",
      walletClient?.account.address,
      sepoliaPaymasterClient?.name,
      sepoliaPublicClient?.name,
    ],
    queryFn: async () => {
      if (!walletClient || !sepoliaPublicClient || !sepoliaPaymasterClient) return null;

      const privySigner = toAccount({
        address: walletClient.account.address as Hex,
        signMessage: async ({ message }) => {
          return signMessage(walletClient, {
            message,
          });
        },
        signTransaction: async () => {
          throw new Error("Smart account signer doesn't need to sign transactions");
        },
        signTypedData: async (typedData) => {
          const { primaryType, domain, message, types } = typedData as TypedDataDefinition<TypedData, string>;
          return signTypedData(walletClient, {
            primaryType,
            domain,
            message,
            types,
          });
        },
        signAuthorization: async (authorization) => {
          return signAuthorization({
            contractAddress: authorization.address as Address,
            ...authorization,
          });
        },
      });

      const ecdsaValidator = await signerToEcdsaValidator(sepoliaPublicClient, {
        signer: privySigner,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });

      const kernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
        signer: privySigner,
        entryPoint,
        kernelVersion,
      });

      const kernelAccountClient = create7702KernelAccountClient({
        account: kernelAccount,
        chain: SEPOLIA,
        bundlerTransport: http(sepoliaBundlerRpc),
        paymaster: sepoliaPaymasterClient,
        client: sepoliaPublicClient,
      });

      return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!sepoliaPublicClient && !!walletClient && !!sepoliaPaymasterClient,
  });

  // intent client
  const { data: intentClient, mutateAsync: createIntentClientMutation } = useMutation({
    mutationKey: [PROVIDER, "intentClient", !!sepoliaPublicClient, !!walletClient, !!sepoliaPaymasterClient],
    mutationFn: async () => {
      if (!basePublicClient) throw new Error("No public client found");
      if (!sepoliaPublicClient) throw new Error("No public client found");
      if (!walletClient) throw new Error("No wallet client found");
      if (!sepoliaPaymasterClient) throw new Error("No paymaster client found");

      const sepoliaEcdsaValidator = await signerToEcdsaValidator(sepoliaPublicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });

      const baseSepoliaEcdsaValidator = await signerToEcdsaValidator(basePublicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });

      const multichainEcdsaValidator = await toMultiChainECDSAValidator(sepoliaPublicClient, {
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
          sudo: sepoliaEcdsaValidator,
          regular: multichainEcdsaValidator,
        },
        kernelVersion,
        entryPoint,
        initConfig: [installIntentExecutor(INTENT_V0_4)],
        pluginMigrations: [getIntentExecutorPluginData(INTENT_V0_4)],
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

      toast.info("Installing intent executor plugins...");
      // empty userop to install the intent executor plugin
      const installSepoliaIntentPlugin = await sepoliaIntentClient
        .sendTransaction({
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
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

      const baseSepoliaPaymasterClient = createZeroDevPaymasterClient({
        chain: baseSepolia,
        transport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
      });
      const baseSepoliaAuthorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: baseSepolia.id,
      });
      // create a kernel account with intent executor plugin
      const baseSepoliaKernelAccount = await createKernelAccount(basePublicClient, {
        address: walletClient!.account.address,
        plugins: {
          regular: baseSepoliaEcdsaValidator,
          sudo: baseSepoliaEcdsaValidator,
        },
        kernelVersion,
        entryPoint,
        initConfig: [installIntentExecutor(INTENT_V0_4)],
        pluginMigrations: [getIntentExecutorPluginData(INTENT_V0_4)],
        eip7702Auth: baseSepoliaAuthorization,
      });

      // create sepolia and base sepolia intent clients
      const baseSepoliaIntentClient = createIntentClient({
        account: baseSepoliaKernelAccount,
        chain: baseSepolia,
        bundlerTransport: http(`https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${baseSepolia.id}`),
        version: INTENT_V0_4,
        paymaster: baseSepoliaPaymasterClient,
      });
      const installBaseSepoliaIntentPlugin = await baseSepoliaIntentClient
        .sendTransaction({
          to: zeroAddress,
          value: BigInt(0),
          data: "0x",
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

      return baseSepoliaIntentClient;
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
      if (!kernelClients) throw new Error("No kernel account client found");
      return kernelClients.kernelAccountClient.sendUserOperation(userOperation);
    },
  });

  const { mutateAsync: sendTransaction } = useMutation({
    mutationKey: [PROVIDER, "sendTransaction"],
    mutationFn: async ({ transaction }: { transaction: SendTransactionParameters }) => {
      if (!kernelClients) throw new Error("No kernel account client found");
      return kernelClients.kernelAccountClient.sendTransaction(transaction);
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
    queryKey: [PROVIDER, "isDeployed", kernelClients?.kernelAccount.address],
    queryFn: async () => {
      if (!kernelClients) return false;
      return kernelClients.kernelAccount.isDeployed();
    },
    enabled: !!kernelClients?.kernelAccount,
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
        kernelAccountClient: kernelClients?.kernelAccountClient,
        kernelAccount: kernelClients?.kernelAccount,
        ecdsaValidator: kernelClients?.ecdsaValidator,
        intentClient: intentClient,
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
