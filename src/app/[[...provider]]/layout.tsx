"use client";
import { ReactScan } from "@/components/react-scan";
// import type { Metadata } from "next";
import batchingExampleCode from "./@batchingExample/code";
import gasSponsorshipExampleCode from "./@gasSponsorshipExample/code";
import permissionsExampleCode from "./@permissionsExample/code";
import chainAbstractionExampleCode from "./@chainAbstractionExample/code";
import ExampleBlock from "@/components/example/example-block";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { ReactQueryProvider } from "@/context/react-query";
import AccountProviderWrapper from "@/context/wrapper";
import { Fira_Code, Monomaniac_One, Noto_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { useParams } from "next/navigation";
import { AccountProviders } from "@/context/account-providers/provider-context";
// import { ThemeProvider } from "@/components/theme-provider";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const monomaniacOne = Monomaniac_One({
  weight: "400",
  variable: "--font-monomaniac-one",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

// export const metadata: Metadata = {
//   title: "7702 Examples - ZeroDev",
//   description: "Explore practical examples of 7702 using ZeroDev with Privy, Dynamic, Turnkey and more!",
// };

export default function RootLayout({
  children,
  batchingExample,
  gasSponsorshipExample,
  permissionsExample,
  chainAbstractionExample,
}: Readonly<{
  children: React.ReactNode;
  batchingExample: React.ReactNode;
  gasSponsorshipExample: React.ReactNode;
  permissionsExample: React.ReactNode;
  chainAbstractionExample: React.ReactNode;
}>) {
  const { provider } = useParams();

  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <ReactScan />
      <body className={`${firaCode.variable} ${monomaniacOne.variable} ${notoSans.variable} antialiased`}>
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
                  github="https://github.com/privy-io/privy-gas-sponsorship"
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
                  github="https://github.com/privy-io/privy-batching"
                  example={batchingExample}
                  codeBlock={batchingExampleCode}
                  key="batching"
                  description={
                    <p className="px-6">
                      When you need to send multiple transactions, you can batch them together to save on gas fees,
                      latency, and the number of times a user needs to sign.
                      <br />
                      <br />
                      Each call in the example below that would have been a separate transaction is batched together and
                      sent as a single user operation.
                    </p>
                  }
                />

                <ExampleBlock
                  index={3}
                  title="Permissions"
                  docs="https://docs.zerodev.app/sdk/permissions/intro"
                  github="https://github.com/privy-io/privy-permissions"
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
                        Thanks to permissions, the user can rest assured that their funds are safe, since the session
                        keys can only do what they were explicitly given permissions to do.
                      </p>
                      <p className="px-6">
                        In this example, we will create a session key that&apos;s allowed to transfer no more than 10
                        tokens.
                      </p>
                    </>
                  }
                />
                <ExampleBlock
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
                />
              </main>
            </div>
            <Footer />
            <Toaster richColors />
          </AccountProviderWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
