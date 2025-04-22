"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { zeroAddress } from "viem";
const BatchingExample = () => {
  const { primaryWallet } = useDynamicContext();

  const {
    data: txHash,
    isPending,
    mutate: handleSendTransaction,
  } = useMutation({
    mutationKey: ["sendTransaction"],
    mutationFn: async () => {
      const connector = primaryWallet?.connector;

      if (!connector) {
        throw new Error("No connector found");
      }

      if (!isZeroDevConnector(connector)) {
        throw new Error("Connector is not a ZeroDev connector");
      }

      const params = {
        withSponsorship: true,
      };
      const kernelClient = connector.getAccountAbstractionProvider(params);

      if (!kernelClient) {
        throw new Error("No kernel client found");
      }

      try {
        const userOpHash = await kernelClient.sendTransaction({
          calls: [
            {
              data: "0x",
              to: zeroAddress,
              value: BigInt(0),
            },
            {
              data: "0x",
              to: zeroAddress,
              value: BigInt(0),
            },
          ],
        });

        const { receipt } = await kernelClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        return receipt.transactionHash;
      } catch (err) {
        throw new Error((err as Error).message || "Error sending transaction");
      }
    },
    onSuccess: () => {
      toast.success("Transaction sent successfully", {
        description: "Transaction sent successfully",
        action: {
          label: "View on Explorer",
          onClick: () => {
            window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank");
          },
        },
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message || "Error sending transaction", {
        description: "Error sending transaction",
      });
    },
  });

  return (
    <div className="border-primary/10 relative h-full w-full space-y-4 border-2 p-4">
      <h4 className="text-lg font-medium">Batching Multiple Transactions</h4>

      <div className="bg-primary hover:bg-primary text-background absolute right-0 -bottom-4 flex h-8 w-full items-center justify-evenly text-sm hover:shadow-none">
        <span>
          Privy: {zeroAddress.slice(0, 6)}...{zeroAddress.slice(-4)}
        </span>
        <span>|</span>
        <span>7702 Deployed: Yes</span>
      </div>

      <div className="flex w-full flex-col gap-4 border border-violet-500 bg-violet-500/5 p-4">
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">1. Deploy Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Token Symbol"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">2. Mint Token</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Amount"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge className="h-9 text-sm font-medium">3. Send to</Badge>
          <Input
            className="bg-background"
            type="text"
            placeholder="Address"
            value="granny.eth"
          />
        </div>

        <Button
          disabled={isPending}
          onClick={() => handleSendTransaction()}
        >
          {isPending ? "Sending..." : "Send Batched Transaction"}
        </Button>
      </div>
    </div>
  );
};

export default BatchingExample;
