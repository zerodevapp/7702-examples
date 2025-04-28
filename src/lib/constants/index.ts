import { KERNEL_V3_3_BETA } from "@zerodev/sdk/constants";

import { KernelVersionToAddressesMap } from "@zerodev/sdk/constants";

import { getEntryPoint } from "@zerodev/sdk/constants";
import { sepolia } from "viem/chains";

export const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
export const kernelVersion = KERNEL_V3_3_BETA;
export const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];
export const bundlerRpc = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
export const paymasterRpc = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`;
export const entryPoint = getEntryPoint("0.7");
export const chain = sepolia;
export const SCOPE_URL = `https://scope.sh/${chain.id}`;

export const TOKEN_ADDRESS = "0x3Ad1E36CCC4d781bf73E24533943c745E50c569b";
export const ZDEV_DECIMALS = 18;

export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
