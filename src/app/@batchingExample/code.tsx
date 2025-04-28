import { CodeBlockProps } from "@/components/ui/code";

const batchingExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "index.js",
        language: "javascript",
        content: `await kernelClient.sendUserOperation({
  account: account,
  calls: [
      {
        to: '0x3Ad1E36CCC4d781bf73E24533943c745E50c569b',
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
