"use client";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";
import { useAccountWrapperContext } from "./wrapper";

export const AccountActionsProviderContext = createContext<{
  // actions
  signAuthorization: () => Promise<string>;
  sendUserOperation: () => Promise<string>;
  signIn: () => Promise<void>;
}>({
  signAuthorization: async () => "",
  sendUserOperation: async () => "",
  signIn: async () => {},
});

export const AccountActionsProvider = ({
  children,
  signIn,
}: {
  children: React.ReactNode;
  signIn: () => Promise<void>;
}) => {
  const { kernelAccountClient } = useAccountWrapperContext();

  const { mutateAsync: signAuthorization } = useMutation({
    mutationKey: ["action: signAuthorization"],
    mutationFn: async () => {
      if (!kernelAccountClient) return "";
      // const signature = await accountProvider.signAuthorization();
      // console.log(signature);
      return "";
    },
  });

  const { mutateAsync: sendUserOperation } = useMutation({
    mutationKey: ["action: sendUserOperation"],
    mutationFn: async () => {
      if (!kernelAccountClient) return "";
      const userOperationHash = await kernelAccountClient.sendUserOperation({
        account: kernelAccountClient.account,
        calls: [
          {
            to: "0x65A49dF64216bE58F8851A553863658dB7Fe301F",
            value: BigInt(0),
            data: "0x",
          },
        ],
      });
      console.log(userOperationHash);
      return userOperationHash;
    },
  });

  return (
    <AccountActionsProviderContext.Provider
      value={{
        signAuthorization,
        sendUserOperation,
        signIn,
      }}
    >
      {children}
    </AccountActionsProviderContext.Provider>
  );
};

export const useAccountActions = () => {
  return useContext(AccountActionsProviderContext);
};
