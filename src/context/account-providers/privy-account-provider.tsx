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

const PROVIDER = "privy";

const chain = sepolia;

const PrivyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [openPrivySignInModal, setOpenPrivySignInModal] = useState(false);
  const { setKernelAccount, setKernelAccountClient, setEmbeddedWallet } = useAccountWrapperContext();
  const { wallets } = useWallets();
  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();

  const embeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
  }, [wallets]);
  const { signAuthorization } = useSignAuthorization();

  const { data: ethereumProvider } = useQuery({
    queryKey: [PROVIDER, "ethereumProvider", !!embeddedWallet],
    queryFn: async () => {
      if (!embeddedWallet) return null;
      return await embeddedWallet.getEthereumProvider();
    },
    enabled: !!embeddedWallet,
  });

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

  const publicClient = useMemo(() => {
    if (!walletClient) return null;
    return createPublicClient({
      chain,
      transport: http(),
    });
  }, [walletClient]);

  const { data: ecdsaValidator } = useQuery({
    queryKey: ["ecdsaValidator", !!publicClient, !!walletClient],
    queryFn: async () => {
      if (!walletClient || !publicClient) return null;
      console.log("CREATING ECDSA VALIDATOR", walletClient);

      return signerToEcdsaValidator(publicClient, {
        signer: walletClient,
        entryPoint: entryPoint,
        kernelVersion: kernelVersion,
      });
    },
    enabled: !!publicClient && !!walletClient,
  });

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

  const paymasterClient = useMemo(() => {
    if (!publicClient) return null;
    return createZeroDevPaymasterClient({
      chain,
      transport: http(paymasterRpc),
    });
  }, [publicClient]);

  const kernelAccountClient = useMemo(() => {
    if (!publicClient || !kernelAccount || !paymasterClient) return null;
    return createKernelAccountClient({
      account: kernelAccount,
      chain,
      bundlerTransport: http(bundlerRpc),
      paymaster: paymasterClient,
      client: publicClient,
    });
  }, [publicClient, kernelAccount, paymasterClient]);

  useEffect(() => {
    if (kernelAccountClient) {
      setKernelAccountClient(kernelAccountClient);
    }
  }, [kernelAccountClient, setKernelAccountClient]);

  const signIn = async () => {
    setOpenPrivySignInModal(true);
  };

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
    console.log("user", user, "embeddedWallet", embeddedWallet);

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
