"use client";
import DynamicSetup from "@/components/provider-setup/dynamic-setup";
import LocalWalletSetup from "@/components/provider-setup/local-setup";
import PrivySetup from "@/components/provider-setup/privy-setup";
import TurnkeySetup from "@/components/provider-setup/turnkey-setup";
import TurnkeyUserPill from "@/components/turnkey-user-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import Heading from "@/components/ui/heading";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { EXPLORER_URL } from "@/lib/constants";
import { capitalize } from "@/lib/utils";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { UserPill as PrivyUserPill } from "@privy-io/react-auth/ui";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const { accountProvider: selectedProvider } = useAccountWrapperContext();
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
            EIP-7702 is an Ethereum update that allows externally owned accounts (EOAs) to upgrade into smart accounts.
            In practical terms, this means that EOA wallets can now enjoy the benefits of account abstraction, such as
            gas sponsorship, transaction batching, transaction automation, and even chain abstraction.
          </p>
          {selectedProvider === "local" ? (
            <p className="">
              This guide will show you how to upgrade EOAs to smart accounts using the ZeroDev SDK and Viem.
            </p>
          ) : (
            <div>
              <p className="">
                This guide assumes that you are building a dapp with embedded wallets powered by{" "}
                {capitalizeProvider(selectedProvider)}. If you are using another embedded wallet, check{" "}
                <Link
                  className="text-primary underline underline-offset-4"
                  href="/"
                >
                  here
                </Link>
                .
              </p>
              <br />
              <p className="">In this guide, we will walk you through:</p>
            </div>
          )}
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

          {selectedProvider === "local" && (
            <>
              <p>For integration with specific embedded wallets, check out these guides:</p>
              <ul className="list-disc pl-8">
                <li>
                  <Link
                    className="text-primary underline underline-offset-4"
                    href="/privy"
                  >
                    Privy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-primary underline underline-offset-4"
                    href="/dynamic"
                  >
                    Dynamic
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-primary underline underline-offset-4"
                    href="/turnkey"
                  >
                    Turnkey
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="@container mb-12 flex flex-col gap-4 space-y-8">
        <Heading>
          Upgrading EOAs to smart accounts {selectedProvider === "local" ? "" : `with ${capitalize(selectedProvider)}`}
        </Heading>

        {/* Right column: Login button */}
        <div className="space-y-4 px-6">
          {/* Account status when logged in */}
          <div className="space-y-2 rounded-md border-2 p-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-medium">
                {capitalizeProvider(selectedProvider)} Account Status
              </span>
              {isDeployed ? (
                <Badge variant="default">Deployed</Badge>
              ) : !embeddedWallet ? (
                <Badge variant="secondary">Logged Out</Badge>
              ) : (
                <Badge variant="secondary">Not Deployed</Badge>
              )}
            </div>

            {embeddedWallet && (
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
            )}

            <div>
              {selectedProvider === "dynamic" ? (
                <DynamicWidget />
              ) : selectedProvider === "privy" ? (
                <PrivyUserPill />
              ) : selectedProvider === "turnkey" ? (
                <TurnkeyUserPill />
              ) : null}
              {selectedProvider === "local" && !embeddedWallet && (
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
          </div>
        </div>

        {/* Left column: Code */}
        <div className="flex flex-col gap-4 px-6">
          <h2 className="text-lg font-medium">
            Setting up {selectedProvider === "local" ? "Local Account" : capitalizeProvider(selectedProvider)} with 7702
          </h2>

          <div className="overflow-y-auto">
            {selectedProvider === "local" && <LocalWalletSetup />}
            {selectedProvider === "privy" && <PrivySetup />}
            {selectedProvider === "dynamic" && <DynamicSetup />}
            {selectedProvider === "turnkey" && <TurnkeySetup />}
          </div>
        </div>

        <div className="space-x-4 px-6">
          <Button
            asChild
            variant={"outline"}
          >
            <Link
              href={
                selectedProvider === "local"
                  ? "https://docs.zerodev.app/sdk/getting-started/quickstart-7702"
                  : selectedProvider === "privy"
                    ? "https://docs.privy.io/recipes/react/eip-7702"
                    : selectedProvider === "dynamic"
                      ? "https://docs.dynamic.xyz/smart-wallets/smart-wallet-providers/7702"
                      : selectedProvider === "turnkey"
                        ? "https://docs.turnkey.com/networks/ethereum#eip-7702-type-4-support"
                        : "https://docs.zerodev.app/"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </Link>
          </Button>
          <Button
            asChild
            variant={"outline"}
          >
            <Link
              href={
                selectedProvider === "local"
                  ? "https://github.com/zerodevapp/7702-examples/blob/main/src/context/account-providers/local-account-provider.tsx"
                  : selectedProvider === "privy"
                    ? "https://github.com/zerodevapp/7702-examples/blob/main/src/context/account-providers/privy-account-provider.tsx"
                    : selectedProvider === "dynamic"
                      ? "https://github.com/zerodevapp/7702-examples/blob/main/src/context/account-providers/dynamic-account-provider.tsx"
                      : selectedProvider === "turnkey"
                        ? "https://github.com/zerodevapp/7702-examples/blob/main/src/context/account-providers/turnkey-account-provider.tsx"
                        : "https://github.com/zerodevapp/7702-examples"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Code
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
