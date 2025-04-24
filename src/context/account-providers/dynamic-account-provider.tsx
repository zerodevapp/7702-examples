import React from "react";

const DynamicAccountProvider = ({ children }: { children: React.ReactNode }) => {
  // const { primaryWallet } = useDynamicContext();

  // const {
  //   data: txHash,
  //   isPending,
  //   mutate: handleSendTransaction,
  // } = useMutation({
  //   mutationKey: ["sendTransaction"],
  //   mutationFn: async () => {
  //     const connector = primaryWallet?.connector;

  //     if (!connector) {
  //       throw new Error("No connector found");
  //     }

  //     if (!isZeroDevConnector(connector)) {
  //       throw new Error("Connector is not a ZeroDev connector");
  //     }

  //     const params = {
  //       withSponsorship: true,
  //     };
  //     const kernelClient = connector.getAccountAbstractionProvider(params);

  //     if (!kernelClient) {
  //       throw new Error("No kernel client found");
  //     }

  //     try {
  //       const userOpHash = await kernelClient.sendTransaction({
  //         calls: [
  //           {
  //             data: "0x",
  //             to: zeroAddress,
  //             value: BigInt(0),
  //           },
  //           {
  //             data: "0x",
  //             to: zeroAddress,
  //             value: BigInt(0),
  //           },
  //         ],
  //       });

  //       const { receipt } = await kernelClient.waitForUserOperationReceipt({
  //         hash: userOpHash,
  //       });

  //       return receipt.transactionHash;
  //     } catch (err) {
  //       throw new Error((err as Error).message || "Error sending transaction");
  //     }
  //   },
  //   onSuccess: () => {
  //     toast.success("Transaction sent successfully", {
  //       description: "Transaction sent successfully",
  //       action: {
  //         label: "View on Explorer",
  //         onClick: () => {
  //           window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank");
  //         },
  //       },
  //     });
  //   },
  //   onError: (error) => {
  //     console.log(error);
  //     toast.error(error.message || "Error sending transaction", {
  //       description: "Error sending transaction",
  //     });
  //   },
  // });
  return children;
};

export default DynamicAccountProvider;
