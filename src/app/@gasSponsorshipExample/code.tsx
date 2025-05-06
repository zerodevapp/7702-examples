import { CodeBlockProps } from "@/components/ui/code";

const gasSponsorshipExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "sendTransaction.ts",
        language: "typescript",
        content: `kernelAccountClient.sendTransaction({
  account: kernelAccount,
  to: ZERODEV_TOKEN_ADDRESS,
  value: BigInt(0),
  data: encodeFunctionData({
    abi: ZERODEV_TOKEN_ABI,
    functionName: "mint",
    args: [kernelAccount.address, amount],
  }),
})`,
      },
      {
        name: "kernelClient.ts",
        language: "typescript",
        content: `const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(sepoliaPaymasterRpc),
});

const kernelAccount = await createKernelAccount(...);

const kernelAccountClient = createKernelAccountClient({
  paymaster: sepoliaPaymasterClient,
  // ...
  account: kernelAccount,
  chain: sepolia,
  bundlerTransport: http(sepoliaBundlerRpc),
  client: sepoliaPublicClient,
});
`,
      },
    ],
  },
];

export default gasSponsorshipExampleCode;
