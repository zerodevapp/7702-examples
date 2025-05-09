import { CodeBlockProps } from "@/components/ui/code";

const batchingExampleCode: Array<CodeBlockProps & { stepTitle?: string }> = [
  {
    type: "files",
    files: [
      {
        name: "createSessionKey.ts",
        language: "typescript",
        content: `const _sessionPrivateKey = generatePrivateKey();
const sessionAccount = privateKeyToAccount(_sessionPrivateKey as Address;

const sessionKeySigner = await toECDSASigner({
  signer: sessionAccount,
});

const permissionPlugin = await toPermissionValidator(publicClient, {
  entryPoint,
  kernelVersion,
  signer: sessionKeySigner,
  policies: [callPolicy],
});

const masterEcdsaValidator = await signerToEcdsaValidator(publicClient, {
  signer: walletClient,
  entryPoint,
  kernelVersion,
});

const sessionKeyKernelAccount = await createKernelAccount(publicClient, {
  entryPoint,
  plugins: {
    sudo: masterEcdsaValidator,
    regular: permissionPlugin,
  },
  kernelVersion: kernelVersion,
  address: masterKernelAccount.address,
});

const kernelPaymaster = createZeroDevPaymasterClient(...);

const kernelClient = createKernelAccountClient({
  account: sessionKeyKernelAccount,
  chain: baseSepolia,
  bundlerTransport: http(baseSepoliaBundlerRpc),
  paymaster: {
    getPaymasterData(userOperation) {
      return kernelPaymaster.sponsorUserOperation({ userOperation });
    },
  },
});`,
      },
      {
        name: "callPolicy.ts",
        language: "typescript",
        content: `const callPolicy = toCallPolicy({
  policyVersion: CallPolicyVersion.V0_0_4,
  permissions: [
    {
      target: ZERODEV_TOKEN_ADDRESS,
      valueLimit: BigInt(0),
      abi: ZERODEV_TOKEN_ABI,
      functionName: "transfer",
      args: [
        {
          condition: ParamCondition.NOT_EQUAL,
          value: zeroAddress,
        },
        {
          condition: ParamCondition.LESS_THAN_OR_EQUAL,
          value: parseUnits("10", ZERODEV_DECIMALS),
        },
      ],
    },
  ],
});
`,
      },
      {
        name: "sendTransaction.ts",
        language: "typescript",
        content: `sessionKernelClient?.sendTransaction({
  calls: [
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
})
`,
      },
    ],
  },
];

export default batchingExampleCode;
