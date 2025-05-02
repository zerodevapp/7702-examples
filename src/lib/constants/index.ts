import { KERNEL_V3_3_BETA } from "@zerodev/sdk/constants";

import { KernelVersionToAddressesMap } from "@zerodev/sdk/constants";

import { getEntryPoint } from "@zerodev/sdk/constants";
import { sepolia } from "viem/chains";

export const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
export const kernelVersion = KERNEL_V3_3_BETA;
export const kernelAddresses = KernelVersionToAddressesMap[kernelVersion];
export const bundlerRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/11155111`;
export const paymasterRpc = `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/11155111`;
export const entryPoint = getEntryPoint("0.7");
export const CHAIN = sepolia;
export const EXPLORER_URL = `https://sepolia.etherscan.io`;

export const ZERODEV_TOKEN_ADDRESS = "0xfe4e9A244DC5Aa212a2e166B670Ebccea112B099";
export const ZERODEV_DECIMALS = 6;

export const BASE_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const SEPOLIA_USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
