"use client";

import { CodeBlockExamples } from "@/components/example/code-block-examples";
import { Button } from "@/components/ui/button";
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { zeroAddress } from "viem";

const BatchingExample = () => {
  const { primaryWallet } = useDynamicContext();

  const {
    data: txHash,
    error,
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
    <div className="w-full p-4">
      {/* <DynamicWidget /> */}
      {primaryWallet && (
        <>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSendTransaction();
            }}
          >
            {isPending ? "Sending..." : "Send Transaction"}
          </Button>
          {error && <p className="text-red-500">{error.message}</p>}
          {txHash && <p className="text-green-500">Transaction sent: {txHash}</p>}
        </>
      )}

      <CodeBlockExamples />
    </div>
  );
};

export default BatchingExample;
