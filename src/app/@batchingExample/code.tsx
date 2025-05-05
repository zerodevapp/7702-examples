import { CodeBlockProps } from "@/components/ui/code";

const batchingExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "index.js",
        language: "javascript",
        content: `await kernelAccountClient.sendUserOperation({
  calls: [
    {
      to: ZERODEV_TOKEN_ADDRESS,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: ZERODEV_TOKEN_ABI,
        functionName: "mint",
        args: [kernelAccountClient.account.address, amount],
      }),
    },
    {
      to: ZERODEV_TOKEN_ADDRESS,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: ZERODEV_TOKEN_ABI,
        functionName: "transfer",
        args: [toAddress, amount],
      }),
    },
  ],
}`,
      },
    ],
  },
];

export default batchingExampleCode;
