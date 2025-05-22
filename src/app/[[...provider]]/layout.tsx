"use client";
import batchingExampleCode from "./@batchingExample/code";
import gasSponsorshipExampleCode from "./@gasSponsorshipExample/code";
import permissionsExampleCode from "./@permissionsExample/code";
// import chainAbstractionExampleCode from "./@chainAbstractionExample/code";
import "@/app/globals.css";
import ExampleBlock from "@/components/example/example-block";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { AccountProviders } from "@/context/account-providers/provider-context";
import { ReactQueryProvider } from "@/context/react-query";
import AccountProviderWrapper from "@/context/wrapper";
import { useParams } from "next/navigation";
import { Toaster } from "sonner";
import "@turnkey/sdk-react/styles";

export default function Layout({
  children,
  batchingExample,
  gasSponsorshipExample,
  permissionsExample,
  // chainAbstractionExample,
}: Readonly<{
  children: React.ReactNode;
  batchingExample: React.ReactNode;
  gasSponsorshipExample: React.ReactNode;
  permissionsExample: React.ReactNode;
  chainAbstractionExample: React.ReactNode;
}>) {
  const { provider } = useParams();

  return (
    <ReactQueryProvider>
      <AccountProviderWrapper initialProvider={provider?.[0] as AccountProviders}>
        <Navigation />
        <div className="border-primary container mx-auto max-w-5xl space-y-12 overflow-hidden border-x-2 py-6">
          <main className="space-y-12">
            {children}

            <ExampleBlock
              index={1}
              title="Gas Sponsorship"
              docs="https://docs.zerodev.app/sdk/core-api/sponsor-gas"
              github="https://github.com/zerodevapp/7702-examples/blob/main/src/app/%5B%5B...provider%5D%5D/%40gasSponsorshipExample/page.tsx"
              example={gasSponsorshipExample}
              codeBlock={gasSponsorshipExampleCode}
              key="gas-sponsorship"
              description={
                <>
                  <p className="px-6">
                    To sponsor gas, create a gas policy such as{" "}
                    <span className="mx-[1ch] font-medium">&quot;Sponsor All&quot;</span>
                    on the ZeroDev dashboard.
                  </p>
                  <p className="px-6">Then, set up a paymaster client with the paymaster RPC from the dashboard.</p>
                </>
              }
            />

            <ExampleBlock
              index={2}
              title="Batching"
              docs="https://docs.zerodev.app/sdk/core-api/batch-transactions"
              github="https://github.com/zerodevapp/7702-examples/blob/main/src/app/%5B%5B...provider%5D%5D/%40batchingExample/page.tsx"
              example={batchingExample}
              codeBlock={batchingExampleCode}
              key="batching"
              description={
                <p className="px-6">
                  When you need to send multiple transactions, you can batch them together to save on gas fees, latency,
                  and the number of times a user needs to sign.
                  <br />
                  <br />
                  Each call in the example below that would have been a separate transaction is batched together and
                  sent as a single user operation.
                </p>
              }
            />

            {provider !== "dynamic" && (
              <ExampleBlock
                index={3}
                title="Permissions"
                docs="https://docs.zerodev.app/sdk/permissions/intro"
                github="https://github.com/zerodevapp/7702-examples/blob/main/src/app/%5B%5B...provider%5D%5D/%40permissionsExample/page.tsx"
                example={permissionsExample}
                codeBlock={permissionsExampleCode}
                key="permissions"
                description={
                  <>
                    <p className="px-6">
                      With ZeroDev smart accounts, you can create temporary keys (session keys) with specific
                      permissions.
                    </p>
                    <p className="px-6">
                      With session keys, you can sign transactions without asking for further user confirmations,
                      therefore enabling &quot;1-click trading.&quot; You can also automate transactions on the server
                      side, to enable use cases like subscription.
                    </p>
                    <p className="px-6">
                      Thanks to permissions, the user can rest assured that their funds are safe, since the session keys
                      can only do what they were explicitly given permissions to do.
                    </p>
                    <p className="px-6">
                      In this example, we will create a session key that&apos;s allowed to transfer no more than 10
                      tokens.
                    </p>
                  </>
                }
              />
            )}
            {/* <ExampleBlock
                  index={4}
                  title="Chain Abstraction"
                  docs="https://docs.zerodev.app/sdk/advanced/chain-abstraction"
                  github="https://github.com/privy-io/privy-chain-abstraction"
                  example={chainAbstractionExample}
                  codeBlock={chainAbstractionExampleCode}
                  key="chain-abstraction"
                  description={
                    <p className="px-6">
                      Chain abstraction allows spending from multiple chains with a single user operation. This example
                      demonstrates how to spend USDC from Base Sepolia and swap to ZDEV token on Sepolia.
                      <br />
                      <br />
                      Chain abstracted balances eliminate the need to track and maintain balances on multiple chains.
                    </p>
                  }
                /> */}
          </main>
        </div>
        <Footer />
        <Toaster richColors />
      </AccountProviderWrapper>
    </ReactQueryProvider>
  );
}
