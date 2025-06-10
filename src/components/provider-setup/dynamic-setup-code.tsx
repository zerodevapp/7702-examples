import { CodeBlockProps } from "../ui/code";

export const dynamicSetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Install Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command:
          "npm i @dynamic-labs/wagmi-connector @dynamic-labs/ethereum-aa @dynamic-labs/ethereum @dynamic-labs/sdk-react-core wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "yarn",
        command:
          "yarn add @dynamic-labs/wagmi-connector @dynamic-labs/ethereum-aa @dynamic-labs/ethereum @dynamic-labs/sdk-react-core wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "pnpm",
        command:
          "pnpm add @dynamic-labs/wagmi-connector @dynamic-labs/ethereum-aa @dynamic-labs/ethereum @dynamic-labs/sdk-react-core wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
    ],
  },
  {
    type: "files",
    stepDescription: "Setup the Dynamic context with your credentials. Initialise the 7702 client as follows.",
    files: [
      {
        name: "client.ts",
        language: "typescript",
        content: `import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"

const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

const { primaryWallet } = useDynamicContext();

// switch network to baseSepolia. this is helpful when using multiple chains
// await primaryWallet.connector.switchNetwork({ networkChainId: baseSepolia.id });

const walletClient = await primaryWallet.connector.eoaConnector.getWalletClient() as WalletClient<Transport, Chain, Account>;
const connector = primaryWallet.connector;

const kernelAccountClient = connector.getAccountAbstractionProvider({
  withSponsorship: true,
});
`,
      },
      {
        name: "context.ts",
        language: "react",
        content: `import { TurnkeyProvider } from "@turnkey/sdk-react";
const wagmiConfig = ...;
const queryClient = new QueryClient();

// wrap your app in the following providers
<QueryClientProvider client={queryClient}>
  <DynamicContextProvider
    settings={{
      // Find your environment id at https://app.dynamic.xyz/dashboard/developer
      environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
      walletConnectors: [
        EthereumWalletConnectors,
        ZeroDevSmartWalletConnectorsWithConfig({ bundlerProvider: "PIMLICO" }),
      ],
    }}
  >
    <WagmiProvider config={wagmiConfig}>
      <DynamicWagmiConnector>
        {children}
      </DynamicWagmiConnector>
    </WagmiProvider>
  </DynamicContextProvider>
</QueryClientProvider>`,
      },
    ],
  },
];
