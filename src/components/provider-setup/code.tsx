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
      {
        name: "client.ts",
        language: "typescript",
        content: `const kernelAccount = createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator!,
  },
  entryPoint,
  kernelVersion,
  address: walletClient!.account.address,
  eip7702Auth: authorization,
});


const paymasterClient = createZeroDevPaymasterClient({
  chain,
  transport: http(paymasterRpc)
});



const kernelAccountClient = createKernelAccountClient({
  account: kernelAccount,
  chain,
  bundlerTransport: http(bundlerRpc),
  paymaster: paymasterClient,
  client: publicClient
});
`,
      },
    ],
  },
];
