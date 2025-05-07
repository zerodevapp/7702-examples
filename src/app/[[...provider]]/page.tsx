"use client";
import PrivySetup from "@/components/provider-setup/privy-setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import Heading from "@/components/ui/heading";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { EXPLORER_URL } from "@/lib/constants";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { UserPill as PrivyUserPill, UserPill } from "@privy-io/react-auth/ui";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const { accountProvider: selectedProvider, setAccountProvider: setSelectedProvider } = useAccountWrapperContext();
  const { login, embeddedWallet, isDeployed } = useAccountProviderContext();

  // Helper function to capitalize the provider name
  const capitalizeProvider = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <>
      <section className="space-y-8">
        <Heading>Introduction</Heading>
        <div className="space-y-4 px-6">
          <p className="">
            EIP-7702 is an Ethereum update that allows externally owned accounts (EOAs) to upgrade into smart accounts.  In practical terms, this means that EOA wallets can now enjoy the benefits of account abstraction, such as gas sponsorship, transaction batching, transaction automation, and even chain abstraction.
          </p>
          <p className="">
            This guide assumes that you are building a dapp with embedded wallets powered by {capitalizeProvider(selectedProvider)}.  We will walk you through:
          </p>
          <ul className="list-disc pl-8">
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#setup"
              >
                Upgrading EOAs to smart accounts
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#gas-sponsorship"
              >
                Sponsor gas for users
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#batching"
              >
                Batch transactions
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#permissions"
              >
                Automate transactions
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-12 space-y-8">
        <section
          id="setup"
          className="@container flex flex-col gap-4"
        >
          <Heading>
            Upgrading EOAs to smart accounts
          </Heading>

          {/* Two-column layout like other examples */}
          <div className="example grid flex-1 grid-cols-1 gap-4 p-4 px-6 @3xl:grid-cols-2">
            {/* Left column: Code */}
            <div className="flex flex-col gap-4 overflow-hidden">
              {selectedProvider === "privy" && <PrivySetup />}
            </div>

            {/* Right column: Login button */}
            <div className="overflow-hidden space-y-4">
              {!embeddedWallet ? (
                <div>
                  {selectedProvider === "dynamic" ? (
                    <DynamicWidget />
                  ) : selectedProvider === "privy" ? (
                    <UserPill />
                  ) : (
                    <Button
                      variant="cta"
                      onClick={() => {
                        login();
                      }}
                    >
                      Create 7702 Account with {capitalizeProvider(selectedProvider)}
                    </Button>
                  )}
                </div>
              ) : (
                /* Account status when logged in */
                <div className="space-y-2 rounded-md border-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-medium">Account Status</span>
                    {isDeployed ? (
                      <Badge variant="default">Deployed</Badge>
                    ) : (
                      <Badge variant="secondary">Not Deployed</Badge>
                    )}
                  </div>

                  <p>User: {embeddedWallet?.user}</p>
                  <p>
                    Address:{" "}
                    <a
                      target="_blank"
                      className="font-medium underline underline-offset-2"
                      href={`${EXPLORER_URL}/address/${embeddedWallet?.address}`}
                    >
                      {embeddedWallet?.address}
                    </a>
                    <CopyButton
                      className="ml-2"
                      copyValue={embeddedWallet.address}
                      onCopy={() => toast.success("Copied Address to clipboard")}
                    />
                  </p>

                  {selectedProvider === "privy" ? (
                    <PrivyUserPill />
                  ) : selectedProvider === "dynamic" ? (
                    <DynamicWidget />
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="space-x-4 px-6">
            <Button
              asChild
              variant={"outline"}
            >
              <Link href="/docs">Docs</Link>
            </Button>
            <Button
              asChild
              variant={"outline"}
            >
              <Link href="https://github.com/zerodevapp/zerodev-wallet-sdk">Full Code</Link>
            </Button>
          </div>
        </section>
      </section>
    </>
  );
}
