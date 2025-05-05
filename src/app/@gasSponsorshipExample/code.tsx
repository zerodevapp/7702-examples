import { CodeBlockProps } from "@/components/ui/code";

const gasSponsorshipExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "index.ts",
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
