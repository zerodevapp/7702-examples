import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bundlerRpc, entryPoint, kernelAddresses, kernelVersion, paymasterRpc } from "@/lib/constants";
import { useCreateWallet, useLoginWithEmail, usePrivy, useSignAuthorization, useWallets } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import React, { useEffect, useMemo, useState } from "react";
import { createPublicClient, createWalletClient, custom, Hex, http } from "viem";
import { sepolia } from "viem/chains";
import { AccountActionsProvider } from "../account-actions-provider";
import { useAccountWrapperContext } from "../wrapper";

/**
 * Constants for the Privy account provider
 */
const PROVIDER = "privy";
const chain = sepolia;

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
  const { setKernelAccount, setKernelAccountClient, setEmbeddedWallet, setPublicClient, setEcdsaValidator } =
    useAccountWrapperContext();
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAuthorization } = useSignAuthorization();

  const embeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);

  const { data: ethereumProvider } = useQuery({
    queryKey: [PROVIDER, "ethereumProvider", !!embeddedWallet],
    queryFn: async () => {
      if (!embeddedWallet) return null;
      return await embeddedWallet.getEthereumProvider();
    },
    enabled: !!embeddedWallet,
  });

  /**
   * Creates a wallet client using the embedded wallet's ethereum provider
   * The configured wallet client or null if not available
   */
  const walletClient = useMemo(() => {
    if (!ethereumProvider || !embeddedWallet) {
      return null;
    }
    return createWalletClient({
      account: embeddedWallet.address as Hex,
      chain,
      transport: custom(ethereumProvider),
    });
  }, [embeddedWallet, ethereumProvider]);

  /**
   * Creates a public client for blockchain interactions
   * The configured public client or null if wallet client is not available
   */
  const publicClient = useMemo(() => {
    if (!walletClient) return null;
    return createPublicClient({
      chain,
      transport: http(),
    });
  }, [walletClient]);

  useEffect(() => {
    if (publicClient) {
      setPublicClient(publicClient);
    }
  }, [publicClient, setPublicClient]);

  /**
   * Creates an ECDSA validator for the kernel account
   * The configured validator or null if prerequisites are not met
   */
  const { data: ecdsaValidator } = useQuery({
    queryKey: ["ecdsaValidator", !!publicClient, !!walletClient],
    queryFn: async () => {
      if (!walletClient || !publicClient) return null;

      return signerToEcdsaValidator(publicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });
    },
    enabled: !!publicClient && !!walletClient,
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
    queryKey: ["kernel-account", !!publicClient, !!walletClient, !!ecdsaValidator],
    queryFn: async () => {
      if (!publicClient) return null;

      const authorization = await signAuthorization({
        contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
        chainId: chain.id,
      });

      return createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator!,
        },
        entryPoint,
        kernelVersion,
        address: walletClient!.account.address,
        eip7702Auth: authorization,
        pluginMigrations: [
          // getIntentExecutorPluginData
        ],
      });
    },
    enabled: !!publicClient && !!walletClient && !!ecdsaValidator,
    retry: false,
  });

  useEffect(() => {
    if (kernelAccount) {
      setKernelAccount(kernelAccount);
    }
  }, [kernelAccount, setKernelAccount]);

  /**
   * Creates a paymaster client for handling gas payments
   * The configured paymaster client or null if public client is not available
   */
  const paymasterClient = useMemo(() => {
    if (!publicClient) return null;
    return createZeroDevPaymasterClient({
      chain,
      transport: http(paymasterRpc),
    });
  }, [publicClient]);

  /**
   * Creates a kernel account client for interacting with the kernel account
   * The configured kernel account client or null if prerequisites are not met
   */
  const kernelAccountClient = useMemo(() => {
    if (!publicClient || !kernelAccount || !paymasterClient) return null;
    return createKernelAccountClient({
      account: kernelAccount,
      chain,
      bundlerTransport: http(bundlerRpc),
      paymaster: paymasterClient,
      client: publicClient,
    });
    // TODO: send empty userops on both chains (base, sepolia)
    // for installing the intent executor plugin
  }, [publicClient, kernelAccount, paymasterClient]);

  useEffect(() => {
    if (ecdsaValidator) {
      setEcdsaValidator(ecdsaValidator);
    }
  }, [ecdsaValidator, setEcdsaValidator]);

  // const { data: kernelIntentAccount } = useQuery({
  //   queryKey: ["kernel-intent-account", !!publicClient, !!kernelAccount, !!paymasterClient, !!ecdsaValidator],
  //   queryFn: async () => {
  //     if (!publicClient || !walletClient) return null;
  //     return create7702KernelAccount(publicClient, {
  //       kernelVersion,
  //       entryPoint,
  //       signer: walletClient!,
  //       // initConfig: [installIntentExecutor(INTENT_V0_4)],
  //       plugins
  //     });
  //   },
  //   enabled: !!publicClient && !!kernelAccount && !!paymasterClient && !!ecdsaValidator,
  // });

  // const intentClient = useMemo(() => {
  //   if (!kernelIntentAccount) return null;
  //   return createIntentClient({
  //     chain,
  //     account: kernelIntentAccount,
  //     bundlerTransport: http(bundlerRpc),
  //     version: INTENT_V0_4,
  //   });
  // }, [kernelIntentAccount]);

  useEffect(() => {
    if (kernelAccountClient) {
      setKernelAccountClient(kernelAccountClient);
    }
    // if (intentClient) {
    //   setIntentClient(intentClient);
    // }
  }, [kernelAccountClient, setKernelAccountClient]);

  /**
   * Handles the sign-in process by opening the Privy sign-in modal
   */
  const signIn = async () => {
    setOpenPrivySignInModal(true);
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
    onSuccess: (data) => {
      setEmbeddedWallet({
        provider: "privy",
        address: data.address,
        user: user?.email?.address ?? "",
      });
    },
  });

  useEffect(() => {
    if (user) {
      if (!embeddedWallet) {
        createEmbeddedWallet();
      } else {
        setEmbeddedWallet({
          provider: "privy",
          address: embeddedWallet?.address ?? "",
          user: user?.email?.address ?? "",
        });
      }
    }
  }, [user, embeddedWallet, setEmbeddedWallet, createEmbeddedWallet]);

  return (
    <>
      <PrivySignInModal
        openPrivySignInModal={openPrivySignInModal}
        setOpenPrivySignInModal={setOpenPrivySignInModal}
      />
      <AccountActionsProvider signIn={signIn}>{children}</AccountActionsProvider>
    </>
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
