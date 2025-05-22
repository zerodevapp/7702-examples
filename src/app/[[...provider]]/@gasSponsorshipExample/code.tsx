import { CodeBlockProps } from "@/components/ui/code";
import { AccountProviders } from "@/context/account-providers/provider-context";

const gasSponsorshipExampleCode = (provider: AccountProviders) => {
  const blocks = [
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
      ],
    },
  ] as Array<CodeBlockProps & { stepTitle?: string }>;
  if (provider !== "dynamic" && blocks[0].type === "files") {
    blocks[0].files.unshift({
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
    });
  }
  return blocks;
};

export default gasSponsorshipExampleCode;
