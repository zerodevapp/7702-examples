"use client";
// import type { Metadata } from "next";
import ExampleBlock from "@/components/example/example-block";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Fira_Code, Monomaniac_One } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "@/context/account-provider";
import { ReactQueryProvider } from "@/context/react-query";
import batchingExampleCode from "@/app/@batchingExample/code";
import gasSponsorshipExampleCode from "@/app/@gasSponsorshipExample/code";
import permissionsExampleCode from "@/app/@permissionsExample/code";
import chainAbstractionExampleCode from "@/app/@chainAbstractionExample/code";
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
      <body className={`${firaCode.variable} ${monomaniacOne.variable} antialiased`}>
        <ReactQueryProvider>
          <AccountProvider>
            <Navigation />
            <div className="border-primary container mx-auto max-w-5xl space-y-12 overflow-hidden border-x-2 py-6">
              <main className="space-y-12">
                {children}

                <ExampleBlock
                  index={1}
                  title="Batching"
                  docs="https://docs.privy.io/guides/batching"
                  github="https://github.com/privy-io/privy-batching"
                  link="https://batching.privy.io"
                  preview="https://batching.privy.io"
                  example={batchingExample}
                  codeBlock={batchingExampleCode}
                  key="batching"
                />
                <ExampleBlock
                  index={2}
                  title="Gas Sponsorship"
                  docs="https://docs.privy.io/guides/gas-sponsorship"
                  github="https://github.com/privy-io/privy-gas-sponsorship"
                  link="https://gas-sponsorship.privy.io"
                  preview="https://gas-sponsorship.privy.io"
                  example={gasSponsorshipExample}
                  codeBlock={gasSponsorshipExampleCode}
                  key="gas-sponsorship"
                />
                <ExampleBlock
                  index={3}
                  title="Permissions"
                  docs="https://docs.privy.io/guides/permissions"
                  github="https://github.com/privy-io/privy-permissions"
                  link="https://permissions.privy.io"
                  preview="https://permissions.privy.io"
                  example={permissionsExample}
                  codeBlock={permissionsExampleCode}
                  key="permissions"
                />
                <ExampleBlock
                  index={4}
                  title="Chain Abstraction"
                  docs="https://docs.privy.io/guides/chain-abstraction"
                  github="https://github.com/privy-io/privy-chain-abstraction"
                  link="https://chain-abstraction.privy.io"
                  preview="https://chain-abstraction.privy.io"
                  example={chainAbstractionExample}
                  codeBlock={chainAbstractionExampleCode}
                  key="chain-abstraction"
                />
              </main>
            </div>
            <Footer />
          </AccountProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
