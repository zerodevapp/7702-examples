import { Address, PublicClient } from "viem";
import { MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS } from "@zerodev/multi-chain-ecdsa-validator";
import { concat } from "viem";

export const abi = [
  {
    type: "function",
    name: "validationConfig",
    inputs: [
      {
        name: "vId",
        type: "bytes21",
        internalType: "ValidationId",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ValidationManager.ValidationConfig",
        components: [
          {
            name: "nonce",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "hook",
            type: "address",
            internalType: "contract IHook",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

export const checkInstallation = async (client: PublicClient, account: Address) => {
  const validationConfig = await client.readContract({
    address: account,
    abi,
    functionName: "validationConfig",
    args: [concat(["0x01", MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS])],
  });

  return validationConfig;
};
