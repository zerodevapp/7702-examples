import { CodeBlockProps } from "@/components/ui/code";

const batchingExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "index.js",
        language: "javascript",
        content: `kernelClient.sendUserOperation({
    account: account,
    calls: [
        {
        to: zeroAddress,
        value: BigInt(0),
        data: '0x',
        },
        {
        to: '0x65A49dF64216bE58F8851A553863658dB7Fe301F',
        value: BigInt(0),
        data: '0x',
        },
    ],
    })
}`,
      },
    ],
  },
];

export default batchingExampleCode;
