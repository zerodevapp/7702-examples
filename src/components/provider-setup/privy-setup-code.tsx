import { CodeBlockProps } from "../ui/code";

export const privySetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Install Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command: "npm i @privy-io/react-auth @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
      },
      {
        type: "yarn",
        command: "yarn add @privy-io/react-auth @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
      },
      {
        type: "pnpm",
        command: "pnpm add @privy-io/react-auth @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
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
        content: `import { usePrivy, useSignAuthorization, useWallets } from "@privy-io/react-auth";

const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

const { wallets } = useWallets();
const { user } = usePrivy();

// get wallet client from privy
const privyEmbeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === "privy");
}, [wallets]);
const walletClient = createWalletClient({
  account: privyEmbeddedWallet.address as Hex,
  chain: baseSepolia,
  });
}

const authorization = await signAuthorization({
  contractAddress: kernelAddresses.accountImplementationAddress,
  chainId: baseSepolia.id,
});

const kernelAccount = await create7702KernelAccount(sepoliaPublicClient, {
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
`,
      },
      {
        name: "context.ts",
        language: "react",
        content: `import { PrivyProvider } from "@privy-io/react-auth";
const wagmiConfig = ...;
const queryClient = new QueryClient();

// wrap your app in the following providers
<QueryClientProvider client={queryClient}>
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
  </WagmiProvider>
</QueryClientProvider>`,
      },
    ],
  },
];
