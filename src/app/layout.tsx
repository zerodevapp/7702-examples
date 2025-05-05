"use client";
import { ReactScan } from "@/components/react-scan";
// import type { Metadata } from "next";
import batchingExampleCode from "@/app/@batchingExample/code";
import gasSponsorshipExampleCode from "@/app/@gasSponsorshipExample/code";
import permissionsExampleCode from "@/app/@permissionsExample/code";
import chainAbstractionExampleCode from "@/app/@chainAbstractionExample/code";
import ExampleBlock from "@/components/example/example-block";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { ReactQueryProvider } from "@/context/react-query";
import AccountProviderWrapper from "@/context/wrapper";
import { Fira_Code, Monomaniac_One, Noto_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
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
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <ReactScan />
      <body className={`${firaCode.variable} ${monomaniacOne.variable} ${notoSans.variable} antialiased`}>
        <ReactQueryProvider>
          <AccountProviderWrapper>
            <Navigation />
            <div className="border-primary container mx-auto max-w-5xl space-y-12 overflow-hidden border-x-2 py-6">
              <main className="space-y-12">
                {children}

                <ExampleBlock
                  index={1}
                  title="Gas Sponsorship"
                  docs="https://docs.privy.io/guides/gas-sponsorship"
                  github="https://github.com/privy-io/privy-gas-sponsorship"
                  example={gasSponsorshipExample}
                  codeBlock={gasSponsorshipExampleCode}
                  key="gas-sponsorship"
                  description={
                    <>
                      <p className="px-6">
                        Sponsoring gas for users is as easy as setting up a project on the ZeroDev dashboard, creating a
                        new <span className="mx-[1ch] font-medium">&quot;Sponsor All&quot;</span> policy and sending the
                        user ops with the Paymaster configured.
                      </p>
                    </>
                  }
                />

                <ExampleBlock
                  index={2}
                  title="Batching"
                  docs="https://docs.privy.io/guides/batching"
                  github="https://github.com/privy-io/privy-batching"
                  example={batchingExample}
                  codeBlock={batchingExampleCode}
                  key="batching"
                  description={
                    <p className="px-6">
                      When you need to send multiple transactions, you can batch them together to save on gas fees and
                      the number of times a user needs to sign.
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
                  docs="https://docs.privy.io/guides/permissions"
                  github="https://github.com/privy-io/privy-permissions"
                  example={permissionsExample}
                  codeBlock={permissionsExampleCode}
                  key="permissions"
                  description={
                    <p className="px-6">
                      Permissions allow you to have a finer control over how users interact with their smart wallet. You
                      can create new (session keys) signers for the smart account, and revoke them when the session
                      ends.
                      <br />
                      <br />
                      You can create signers which can have certain policies like which contract they can call, what
                      functions they can call and signer customisation (ECDSA, WebAuthn).
                    </p>
                  }
                />
                <ExampleBlock
                  index={4}
                  title="Chain Abstraction"
                  docs="https://docs.privy.io/guides/chain-abstraction"
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
