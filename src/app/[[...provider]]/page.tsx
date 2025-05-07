"use client";
import PrivySetup from "@/components/provider-setup/privy-setup";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import Heading from "@/components/ui/heading";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
import { useAccountWrapperContext } from "@/context/wrapper";
import { EXPLORER_URL } from "@/lib/constants";
import { capitalize } from "@/lib/utils";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { UserPill as PrivyUserPill, UserPill } from "@privy-io/react-auth/ui";
import { Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const { accountProvider: selectedProvider, setAccountProvider: setSelectedProvider } = useAccountWrapperContext();

  const { login, embeddedWallet, isDeployed } = useAccountProviderContext();

  return (
    <>
      <section className="space-y-8">
        <Heading>Introduction to 7702</Heading>
        <div className="space-y-4 px-6">
          <p className="">
            EIP-7702 introduces a new concept to Ethereum which allows Externally Owned Wallets to have smart-contract
            like code.
          </p>
          <p className="">
            ZeroDev, an account abstraction infrastructure allows you to use 7702 for various groundbreaking use cases.
          </p>
          <p className="">
            Explore the 7702 magic with the live examples below. To get started with 7702 you can read the{" "}
            <Link
              href="/docs"
              className="text-primary underline underline-offset-4"
            >
              docs
            </Link>{" "}
            and set up a project on the{" "}
            <Link
              href="/dashboard"
              className="text-primary underline underline-offset-4"
            >
              ZeroDev Dashboard
            </Link>
            .
          </p>
        </div>

        {/* Table of contents for the examples */}
        <div className="space-y-4 px-6">
          <h2 className="font-mono text-xl">Table of Contents</h2>
          <ul className="list-disc pl-8">
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#batching"
              >
                Batching
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#gas-sponsorship"
              >
                Gas Sponsorship
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#permissions"
              >
                Permissions
              </Link>
            </li>
            <li>
              <Link
                className="text-primary underline underline-offset-4"
                href="#chain-abstraction"
              >
                Chain Abstraction
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-12 space-y-8">
        <Heading>Examples</Heading>

        <Heading
          as="h3"
          className="text-lg"
          variant="secondary"
        >
          {selectedProvider === "local" ? "Account Providers" : `Account Provider - ${capitalize(selectedProvider)}`}
        </Heading>

        <div className="space-y-4 px-6">
          <p className="">
            {/* Various strategies can be implemented to achieve account abstraction using 7702 like using embedded wallets
            or injected (browser) wallets. Embedded wallets like Privy, Dynamic, Turnkey let you use social logins along
            with other perks. */}
            With the ZeroDev SDK, you can use various account providers to create 7702 accounts. Embedded wallets like{" "}
            {selectedProvider === "local" ? "Privy, Dynamic, Turnkey" : capitalize(selectedProvider)} let you use social
            logins along with other perks.
            <br />
            Alternatively, you can also use a local wallet to create a 7702 account.
          </p>

          {selectedProvider === "local" && <p>Explore the examples with different account providers.</p>}

          <div className="w-full">
            <div className="flex w-full gap-4">
              <Button
                variant={selectedProvider === "privy" ? "active" : "default"}
                onClick={() => setSelectedProvider("privy")}
              >
                {selectedProvider === "privy" && (
                  <div className="bg-primary absolute top-0 right-0 h-4 w-4 p-0.5 text-white">
                    <Check className="m-auto size-3" />
                  </div>
                )}
                Privy
              </Button>
              <Button
                variant={selectedProvider === "dynamic" ? "active" : "default"}
                onClick={() => setSelectedProvider("dynamic")}
              >
                {selectedProvider === "dynamic" && (
                  <div className="bg-primary absolute top-0 right-0 h-4 w-4 p-0.5 text-white">
                    <Check className="m-auto size-3" />
                  </div>
                )}
                Dynamic
              </Button>
              <Button
                variant={selectedProvider === "turnkey" ? "active" : "default"}
                onClick={() => setSelectedProvider("turnkey")}
              >
                {selectedProvider === "turnkey" && (
                  <div className="bg-primary absolute top-0 right-0 h-4 w-4 p-0.5 text-white">
                    <Check className="m-auto size-3" />
                  </div>
                )}
                Turnkey
              </Button>
              <Button
                variant={selectedProvider === "local" ? "active" : "default"}
                onClick={() => setSelectedProvider("local")}
              >
                {selectedProvider === "local" && (
                  <div className="bg-primary absolute top-0 right-0 h-4 w-4 p-0.5 text-white">
                    <Check className="m-auto size-3" />
                  </div>
                )}
                Local Wallet
              </Button>
            </div>
          </div>
          {!embeddedWallet ? (
            <>
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
                  Create 7702 Account with <span className="capitalize">{selectedProvider}</span>
                </Button>
              )}
            </>
          ) : null}

          {/* 7702 status and provider details of the account */}
          {embeddedWallet && (
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
              {/* <p>
                Account Implementation:{" "}
                <a
                  target="_blank"
                  className="font-medium underline underline-offset-2"
                  href={`${EXPLORER_URL}/address/${kernelAccount?.authorization?.address}`}
                >
                  {kernelAccount?.a }
                </a>
              </p> */}

              {selectedProvider === "privy" ? (
                <PrivyUserPill />
              ) : selectedProvider === "dynamic" ? (
                <DynamicWidget />
              ) : null}
            </div>
          )}
        </div>

        <Accordion
          type="multiple"
          className="space-y-8 px-6"
        >
          <AccordionItem value="privy">
            <AccordionTrigger className="border-primary/10 cursor-pointer border-2 px-4 underline-offset-4">
              <span className="text-base">
                How to setup <span className="capitalize">{selectedProvider} with ZeroDev?</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-primary/10 space-y-4 border-2 border-t-0 p-4 text-base">
              <p>
                To get started with {selectedProvider} you can read the{" "}
                <Link
                  href="/docs"
                  className="text-primary underline underline-offset-4"
                >
                  docs
                </Link>
                .
              </p>

              {selectedProvider === "privy" && <PrivySetup />}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}
