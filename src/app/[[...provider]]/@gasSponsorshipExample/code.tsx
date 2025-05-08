import { CodeBlockProps } from "@/components/ui/code";

const gasSponsorshipExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "kernelClient.ts",
        language: "typescript",
        content: `const paymasterClient = createZeroDevPaymasterClient({
  chain: baseSepolia,
  transport: http(baseSepoliaPaymasterRpc),
});

const kernelAccount = await create7702KernelAccount(...);

const kernelAccountClient = create7702KernelAccountClient({
  paymaster: baseSepoliaPaymasterClient,

  // ...
  bundlerTransport: http(baseSepoliaBundlerRpc),
  account: kernelAccount,
  chain: baseSepolia,
  client: baseSepoliaPublicClient,
});
`,
      },
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
    ],
  },
];

export default gasSponsorshipExampleCode;
