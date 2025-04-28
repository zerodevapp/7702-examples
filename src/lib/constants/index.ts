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

export const ZERODEV_TOKEN_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
export const ZERODEV_DECIMALS = 18;

export const BASE_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const SEPOLIA_USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
