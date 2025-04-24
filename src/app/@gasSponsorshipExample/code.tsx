import { CodeBlockProps } from "@/components/ui/code";

const gasSponsorshipExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "index.ts",
        language: "typescript",
        content: `await kernelAccountClient?.sendTransaction({
  account: kernelAccountClient.account,
  to: zeroAddress,
  value: BigInt(0),
  data: "0x",
  chain: chain,
});`,
      },
      {
        name: "client.ts",
        language: "typescript",
        content: `const kernelAccount = createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator!,
  },
  entryPoint,
  kernelVersion,
  address: walletClient!.account.address,
  eip7702Auth: authorization,
});


const paymasterClient = createZeroDevPaymasterClient({
  chain,
  transport: http(paymasterRpc)
});



const kernelAccountClient = createKernelAccountClient({
  account: kernelAccount,
  chain,
  bundlerTransport: http(bundlerRpc),
  paymaster: paymasterClient,
  client: publicClient
});
`,
      },
    ],
  },
];

export default gasSponsorshipExampleCode;
