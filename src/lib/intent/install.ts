import { AccountNotFoundError } from "@zerodev/sdk";
import type { Chain, Client, Hash, Prettify, SignedAuthorization, Transport } from "viem";
import {
  Address,
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
  parseAbiParameters,
  zeroAddress,
} from "viem";
import { type SmartAccount, sendUserOperation } from "viem/account-abstraction";
import { parseAccount } from "viem/accounts";
import { getAction } from "viem/utils";

type InstallExecutorParameters = {
  executor: Address;
  account?: SmartAccount;
  authorization?: SignedAuthorization;
};

const EXECUTOR_MODULE_TYPE = 2;
const installModuleFunction = "function installModule(uint256 _type, address _module, bytes calldata _initData)";
export async function installExecutor<account extends SmartAccount | undefined, chain extends Chain | undefined>(
  client: Client<Transport, chain, account>,
  args: Prettify<InstallExecutorParameters>,
): Promise<Hash> {
  const { executor, account: account_ = client.account, authorization } = args;
  if (!account_) throw new AccountNotFoundError();
  const account = parseAccount(account_) as SmartAccount;

  return await getAction(
    client,
    sendUserOperation,
    "sendUserOperation",
  )({
    account,
    callData: encodeFunctionData({
      abi: parseAbi([installModuleFunction]),
      functionName: "installModule",
      args: [
        BigInt(EXECUTOR_MODULE_TYPE),
        executor,
        concat([
          zeroAddress,
          encodeAbiParameters(parseAbiParameters("bytes executorData, bytes hookData"), ["0x", "0x"]),
        ]) as `0x{string}`,
      ],
    }),
    authorization,
  });
}

const VALIDATOR_MODULE_TYPE = 1;
type InstallValidatorParameters = {
  validator: Address;
  validatorData: string;
  account?: SmartAccount;
  authorization?: SignedAuthorization;
};

export async function installValidator<account extends SmartAccount | undefined, chain extends Chain | undefined>(
  client: Client<Transport, chain, account>,
  args: Prettify<InstallValidatorParameters>,
): Promise<Hash> {
  const { validator, validatorData, account: account_ = client.account, authorization } = args;
  if (!account_) throw new AccountNotFoundError();
  const account = parseAccount(account_) as SmartAccount;

  return await getAction(
    client,
    sendUserOperation,
    "sendUserOperation",
  )({
    account,
    callData: encodeFunctionData({
      abi: parseAbi([installModuleFunction]),
      functionName: "installModule",
      args: [
        BigInt(VALIDATOR_MODULE_TYPE),
        validator,
        concat([
          zeroAddress,
          encodeAbiParameters(parseAbiParameters("bytes validatorData, bytes hookData, bytes selectorData"), [
            validatorData as `0x{string}`,
            "0x",
            "0x",
          ]),
        ]) as `0x{string}`,
      ],
    }),
    authorization,
  });
}
