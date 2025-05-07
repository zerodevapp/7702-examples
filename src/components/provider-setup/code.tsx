import { CodeBlockProps } from "../ui/code";

export const privySetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Installing Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command: "npm i @privy-io/react-auth @tanstack/react-query wagmi viem",
      },
      {
        type: "yarn",
        command: "yarn add @privy-io/react-auth @tanstack/react-query wagmi viem",
      },
      {
        type: "pnpm",
        command: "pnpm add @privy-io/react-auth @tanstack/react-query wagmi viem",
      },
    ],
  },
  {
    type: "files",
    stepDescription: "Setup the Privy context with your credentials. Initialise the 7702 client as follows.",
    files: [
      {
        name: "client.ts",
        language: "typescript",
        content: `const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

// get wallet client from privy
const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
}, [wallets]);

const walletClient = useQuery({
    queryKey: ['privy', "walletClient", privyEmbeddedWallet?.address],
    queryFn: async () => {
      if (!privyEmbeddedWallet) {
        return null;
      }
    return createWalletClient({
      account: privyEmbeddedWallet.address as Hex,
      chain: baseSepolia,
      });
    },
    enabled: !!privyEmbeddedWallet,
});

const { data: kernelClients } = useQuery({
    queryKey: [
        'privy',
        "kernelClients",
        walletClient?.account.address,
        baseSepoliaPaymasterClient?.name,
        baseSepoliaPublicClient?.name,
    ],
    queryFn: async () => {
        if (!walletClient || !baseSepoliaPublicClient || !baseSepoliaPaymasterClient) return null;

        const ecdsaValidator = await signerToEcdsaValidator(baseSepoliaPublicClient, {
            signer: walletClient,
            entryPoint: getEntryPoint("0.7"),
            kernelVersion: KERNEL_V3_3,
        });

        const authorization = await signAuthorization({
            contractAddress: kernelAddresses.accountImplementationAddress, // The address of the smart contract
            chainId: baseSepolia.id,
        });

        const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint: getEntryPoint("0.7"),
            kernelVersion: KERNEL_V3_3,
            address: walletClient.account.address,
            eip7702Auth: authorization,
        });

        const kernelAccountClient = createKernelAccountClient({
            account: kernelAccount,
            chain: baseSepolia,
            bundlerTransport: http(baseSepoliaBundlerRpc),
            paymaster: baseSepoliaPaymasterClient,
            client: baseSepoliaPublicClient,
        });

        return { kernelAccountClient, kernelAccount, ecdsaValidator };
    },
    enabled: !!baseSepoliaPublicClient && !!walletClient && !!baseSepoliaPaymasterClient,
});
`,
      },
      {
        name: "context.ts",
        language: "react",
        content: `import { PrivyProvider } from "@privy-io/react-auth";

// const wagmiConfig = ...;

<WagmiProvider config={wagmiConfig}>
    <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
        config={{
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
                showWalletUIs: true,
                createOnLogin: "all-users",
            },
        }}
    >
        {children}
    </PrivyProvider>
</WagmiProvider>`,
      },
    ],
  },
];
