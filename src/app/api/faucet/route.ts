// {
//     "operationName": "RequestToken",
//     "variables": {
//         "input": {
//             "destinationAddress": "0x0b90994F83D2Fde68f83C418141B42550dE2Cb4c",
//             "token": "USDC",
//             "blockchain": "BASE"
//         }
//     },
//     "query": "mutation RequestToken($input: RequestTokenInput!) {\n  requestToken(input: $input) {\n    ...RequestTokenResponseInfo\n    __typename\n  }\n}\n\nfragment RequestTokenResponseInfo on RequestTokenResponse {\n  amount\n  blockchain\n  contractAddress\n  currency\n  destinationAddress\n  explorerLink\n  hash\n  status\n  __typename\n}"
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { destinationAddress } = await request.json();

  const response = await fetch("https://faucet.circle.com/api/graphql", {
    method: "POST",
    body: JSON.stringify({
      operationName: "RequestToken",
      variables: {
        input: {
          destinationAddress,
          token: "USDC",
          blockchain: "BASE",
        },
      },
      query:
        "mutation RequestToken($input: RequestTokenInput!) {\n  requestToken(input: $input) {\n    ...RequestTokenResponseInfo\n    __typename\n  }\n}\n\nfragment RequestTokenResponseInfo on RequestTokenResponse {\n  amount\n  blockchain\n  contractAddress\n  currency\n  destinationAddress\n  explorerLink\n  hash\n  status\n  __typename\n}",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  return NextResponse.json(data);
}
