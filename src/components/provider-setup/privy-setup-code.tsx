import { CodeBlockProps } from "../ui/code";

export const privySetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Install Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command: "npm i @privy-io/react-auth wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "yarn",
        command: "yarn add @privy-io/react-auth wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "pnpm",
        command: "pnpm add @privy-io/react-auth wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
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
        content: `
import { useCreateWallet, useLogin, usePrivy, useSignAuthorization, useWallets } from "@privy-io/react-auth";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { createWalletClient, custom, Hex, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";

const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

// get privy wallet
const { wallets } = useWallets();
const { user } = usePrivy();
const { createWallet } = useCreateWallet();
const { signAuthorization } = useSignAuthorization();

const privyEmbeddedWallet = useMemo(() => {
  return wallets.find((wallet) => wallet.walletClientType === "privy");
}, [wallets]);

const privyAccount = createWalletClient({
  account: privyEmbeddedWallet.address as Hex,
  chain: baseSepolia,
  transport: custom(await privyEmbeddedWallet.getEthereumProvider()),
});

const sepoliaPublicClient = usePublicClient({
  chainId: sepolia.id,
});
const baseSepoliaPublicClient = usePublicClient({
  chainId: baseSepolia.id,
});

const baseSepoliaPaymasterClient = createZeroDevPaymasterClient({
  chain: baseSepolia,
  transport: http(baseSepoliaPaymasterRpc),
});

const authorization = await signAuthorization({
  contractAddress: kernelAddresses.accountImplementationAddress,
  chainId: baseSepolia.id,
});

const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
  eip7702Account: privyAccount,
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
`,
      },
      {
        name: "context.ts",
        language: "react",
        content: `iimport { PrivyProvider } from "@privy-io/react-auth";
import { UserPill as PrivyUserPill } from "@privy-io/react-auth/ui";

const wagmiConfig = ...;
const queryClient = new QueryClient();

// wrap your app in the following providers
<WagmiProvider config={wagmiConfig}>
  <PrivyProvider
    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
    clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
    config={{
      // Create embedded wallets for users who don't have a wallet
      embeddedWallets: {
        showWalletUIs: false,
        createOnLogin: "all-users",
      },
    }}
  >
    <PrivyAccountProvider>
      <PrivyUserPill />
      {children}
    </PrivyAccountProvider>
  </PrivyProvider>
</WagmiProvider>`,
      },
    ],
  },
];
