import { CodeBlockProps } from "../ui/code";

export const turnkeySetupCode: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }> = [
  {
    stepTitle: "Install Dependencies",
    type: "command",
    packageManagers: [
      {
        type: "npm",
        command:
          "npm i @turnkey/sdk-react @turnkey/viem wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "yarn",
        command:
          "yarn add @turnkey/sdk-react @turnkey/viem wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
      {
        type: "pnpm",
        command:
          "pnpm add @turnkey/sdk-react @turnkey/viem wagmi @zerodev/ecdsa-validator @zerodev/sdk @tanstack/react-query",
      },
    ],
  },
  {
    type: "files",
    stepDescription: "Setup the Turnkey context with your credentials. Initialise the 7702 client as follows.",
    files: [
      {
        name: "client.ts",
        language: "typescript",
        content: `import { useTurnkey } from "@turnkey/sdk-react";
import { createAccount } from "@turnkey/viem";

const kernelVersion = KERNEL_V3_3;
const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];

// creating kernel clients with turnkey
const { turnkey, authIframeClient, getActiveClient } = useTurnkey();

const session = await turnkey?.getSession();
const turnkeyActiveAuthClient = await getActiveClient();
await authIframeClient.injectCredentialBundle(session!.token);
const suborgId = session?.organizationId;
const userResponse = await authIframeClient!.getUser({
  organizationId: suborgId!,
  userId: session.userId!,
});
const walletsResponse = await authIframeClient!.getWallets({
  organizationId: suborgId!,
});

let selectedWalletId = null;
let selectedAccount = null;

// Default to the first wallet if available
if (walletsResponse.wallets.length > 0) {
  selectedWalletId = walletsResponse.wallets[0].walletId;

  const accountsResponse = await authIframeClient!.getWalletAccounts({
    organizationId: suborgId!,
    walletId: selectedWalletId,
  });

  if (accountsResponse.accounts.length > 0) {
    selectedAccount = accountsResponse.accounts.filter(
      (account) => account.addressFormat === "ADDRESS_FORMAT_ETHEREUM",
    )?.[0];
  }
}

const viemAccount = await createAccount({
  client: turnkeyActiveClient,
  organizationId: suborgId!,
  signWith: selectedAccount?.address,
  ethereumAddress: selectedAccount?.address,
});

const viemWalletClient = createWalletClient({
  account: viemAccount as Account,
  chain: baseSepolia,
  transport: http(),
});

const authorization = await viemWalletClient.signAuthorization({
  chainId: baseSepolia.id,
  nonce: 0,
  address: kernelAddresses.accountImplementationAddress,
});

const kernelAccount = await createKernelAccount(baseSepoliaPublicClient, {
  eip7702Account: viemWalletClient,
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
        content: `import { TurnkeyProvider } from "@turnkey/sdk-react";
const wagmiConfig = ...;
const queryClient = new QueryClient();

// wrap your app in the following providers
<QueryClientProvider client={queryClient}>
  <WagmiProvider config={wagmiConfig}>
    <TurnkeyProvider
      config={{
        // apiBaseUrl: "https://api.turnkey.com",
        apiBaseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
        defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
        iframeUrl: "https://auth.turnkey.com",
        rpId: process.env.NEXT_PUBLIC_RP_ID, // Your application's domain for WebAuthn flows
      }}
    >
      <TurnkeyAccountProvider>{children}</TurnkeyAccountProvider>
    </TurnkeyProvider>
  </WagmiProvider>
</QueryClientProvider>`,
      },
      {
        name: "turnkey-user-pill.tsx",
        language: "react",
        content: `import { Auth as TurnkeyAuth, useTurnkey } from "@turnkey/sdk-react";

<TurnkeyAuth
  authConfig={{
    emailEnabled: true,
    // Set the rest to false to disable them
    passkeyEnabled: false,
    phoneEnabled: false,
    appleEnabled: false,
    facebookEnabled: false,
    googleEnabled: false,
    walletEnabled: false,
  }}
  onAuthSuccess={async () => {
    // ...
  }}
  onError={(error) => {
    // ...
  }}
  configOrder={["email"]}
/>`,
      },
    ],
  },
];
