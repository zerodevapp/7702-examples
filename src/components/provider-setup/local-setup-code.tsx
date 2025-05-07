import { CodeBlockProps } from "../ui/code";

export const localSetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Installing Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command: "npm i @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
      },
      {
        type: "yarn",
        command: "yarn add @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
      },
      {
        type: "pnpm",
        command: "pnpm add @tanstack/react-query wagmi viem @zerodev/ecdsa-validator @zerodev/sdk",
      },
    ],
  },
  {
    type: "files",
    stepDescription: "Initialise the 7702 client with Viem and Wagmi as follows.",
    files: [
      {
        name: "client.ts",
        language: "typescript",
        content: `const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

const newPrivateKey = generatePrivateKey();
const newAccount = privateKeyToAccount(newPrivateKey);

const baseSepoliaPublicClient = usePublicClient({
  chainId: baseSepolia.id,
});

const authorization = await account.signAuthorization({
  chainId: baseSepolia.id,
  nonce: 0,
  address: kernelAddresses.accountImplementationAddress,
});

const kernelAccount = await create7702KernelAccount(baseSepoliaPublicClient, {
  signer: account,
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

const ecdsaValidator = await signerToEcdsaValidator(baseSepoliaPublicClient, {
  signer: account,
  entryPoint,
  kernelVersion,
});
`,
      },
      {
        name: "context.ts",
        language: "react",
        content: `const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

<WagmiProvider config={wagmiConfig}>
  <LocalAccountProvider>{children}</LocalAccountProvider>
</WagmiProvider>`,
      },
    ],
  },
];
