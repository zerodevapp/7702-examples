"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { useAccountActions } from "@/context/account-actions-provider";
import { useAccountWrapperContext } from "@/context/wrapper";
import { SCOPE_URL } from "@/lib/constants";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const {
    accountProvider: selectedProvider,
    kernelAccount,
    setAccountProvider: setSelectedProvider,
    embeddedWallet,
  } = useAccountWrapperContext();
  const { signIn, signAuthorization } = useAccountActions();
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
          Select an Account Provider
        </Heading>

        <div className="space-y-4 px-6">
          <p className="">
            Various strategies can be implemented to achieve account abstraction using 7702 like using embedded wallets
            or injected (browser) wallets. Embedded wallets like Privy, Dynamic, Turnkey let you use social logins along
            with other perks.
          </p>

          <p className="">Select any one of the options to experience 7702 in action.</p>

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
                variant={selectedProvider === "browser" ? "active" : "default"}
                onClick={() => setSelectedProvider("browser")}
              >
                {selectedProvider === "browser" && (
                  <div className="bg-primary absolute top-0 right-0 h-4 w-4 p-0.5 text-white">
                    <Check className="m-auto size-3" />
                  </div>
                )}
                Browser Wallet
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              signIn();
            }}
          >
            Sign In with <span className="capitalize">{selectedProvider}</span>
          </Button>

          {/* 7702 status and provider details of the account */}
          {embeddedWallet && (
            <div className="space-y-2 rounded-md border-2 p-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-medium">Account Status</span>
                {kernelAccount?.isDeployed ? (
                  <Badge variant="default">Deployed</Badge>
                ) : (
                  <Badge variant="secondary">Not Deployed</Badge>
                )}
              </div>

              <p>
                Address:{" "}
                <a
                  className="font-medium underline underline-offset-2"
                  href={`${SCOPE_URL}/address/${kernelAccount?.address}`}
                >
                  {embeddedWallet?.address}
                </a>
              </p>
              <p>
                EIP7702 Auth:{" "}
                <a
                  target="_blank"
                  className="font-medium underline underline-offset-2"
                  href={`${SCOPE_URL}/address/${kernelAccount?.eip7702Auth?.address}`}
                >
                  {kernelAccount?.eip7702Auth?.address}
                </a>
              </p>

              {!kernelAccount?.isDeployed ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    signAuthorization();
                  }}
                >
                  Upgrade <span className="capitalize">{selectedProvider}</span> Account to 7702 account
                </Button>
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
            <AccordionContent className="border-primary/10 border-2 border-t-0 p-4">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}
