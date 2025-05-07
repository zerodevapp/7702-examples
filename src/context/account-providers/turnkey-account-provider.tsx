import { useTurnkey } from "@turnkey/sdk-react";
import React from "react";
import { AccountProviderContext } from "./provider-context";

const PROVIDER = "turnkey";
const TurnkeyAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const { turnkey, client, walletClient } = useTurnkey();
  console.log({ turnkey, client, walletClient });

  return (
    <AccountProviderContext.Provider
      value={{
        createIntentClient: async () => {
          throw new Error("Not implemented");
        },
        embeddedWallet: null,
        isDeployed: false,
        login: async () => {},
        provider: PROVIDER,
        ecdsaValidator: undefined,
        intentClient: undefined,
        kernelAccount: undefined,
        kernelAccountClient: undefined,
      }}
    >
      {/* <TurnKeySignIn
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        signedMessage={signedMessage}
        setSignedMessage={setSignedMessage}
        subOrgId={subOrgId}
        setSubOrgId={setSubOrgId}
        openTurnkeySignInModal={openTurnkeySignInModal}
        setOpenTurnkeySignInModal={setOpenTurnkeySignInModal}
      /> */}
      {children}
    </AccountProviderContext.Provider>
  );
};

export default TurnkeyAccountProvider;

// export const TurnKeySignIn = ({
//   privateKey,
//   setPrivateKey,
//   signedMessage,
//   setSignedMessage,
//   subOrgId,
//   setSubOrgId,
//   openTurnkeySignInModal,
//   setOpenTurnkeySignInModal,
// }: {
//   privateKey: TPrivateKeyState;
//   setPrivateKey: (privateKey: TPrivateKeyState) => void;
//   signedMessage: TSignedMessage;
//   setSignedMessage: (signedMessage: TSignedMessage) => void;
//   subOrgId: string | null;
//   setSubOrgId: (subOrgId: string | null) => void;
//   openTurnkeySignInModal: boolean;
//   setOpenTurnkeySignInModal: (openTurnkeySignInModal: boolean) => void;
// }) => {
//   const { handleSubmit: subOrgFormSubmit } = useForm<subOrgFormData>();
//   const { register: signingFormRegister, handleSubmit: signingFormSubmit } = useForm<signingFormData>();
//   const { handleSubmit: privateKeyFormSubmit } = useForm<privateKeyFormData>();

//   const stamper = new WebauthnStamper({
//     rpId: "localhost",
//   });

//   const passkeyHttpClient = new TurnkeyClient(
//     {
//       baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
//     },
//     stamper,
//   );

//   const createPrivateKey = async () => {
//     if (!subOrgId) {
//       throw new Error("sub-org id not found");
//     }

//     const signedRequest = await passkeyHttpClient.stampCreatePrivateKeys({
//       type: "ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2",
//       organizationId: subOrgId,
//       timestampMs: String(Date.now()),
//       parameters: {
//         privateKeys: [
//           {
//             privateKeyName: `ETH Key ${Math.floor(Math.random() * 1000)}`,
//             curve: "CURVE_SECP256K1",
//             addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
//             privateKeyTags: [],
//           },
//         ],
//       },
//     });

//     const response = await fetch("/api/turnkey/createKey", {
//       method: "POST",
//       body: JSON.stringify(signedRequest),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     const data = await response.json();

//     setPrivateKey({
//       id: data["privateKeyId"],
//       address: data["address"],
//     });
//   };

//   const signMessage = async (data: signingFormData) => {
//     if (!subOrgId || !privateKey) {
//       throw new Error("sub-org id or private key not found");
//     }

//     const viemAccount = await createAccount({
//       client: passkeyHttpClient,
//       organizationId: subOrgId,
//       signWith: privateKey.id,
//       ethereumAddress: privateKey.address,
//     });

//     const viemClient = createWalletClient({
//       account: viemAccount,
//       chain: sepolia,
//       transport: http(),
//     });

//     const signedMessage = await viemClient.signMessage({
//       message: data.messageToSign,
//     });

//     setSignedMessage({
//       message: data.messageToSign,
//       signature: signedMessage,
//     });
//   };

//   const createSubOrg = async () => {
//     const challenge = generateRandomBuffer();
//     const subOrgName = `Turnkey Viem+Passkey Demo - ${humanReadableDateTime()}`;
//     const authenticatorUserId = generateRandomBuffer();

//     const attestation = await getWebAuthnAttestation({
//       publicKey: {
//         rp: {
//           id: "localhost",
//           name: "Turnkey Viem Passkey Demo",
//         },
//         challenge,
//         pubKeyCredParams: [
//           {
//             type: "public-key",
//             // All algorithms can be found here: https://www.iana.org/assignments/cose/cose.xhtml#algorithms
//             // Turnkey only supports ES256 at the moment.
//             alg: -7,
//           },
//         ],
//         user: {
//           id: authenticatorUserId,
//           name: subOrgName,
//           displayName: subOrgName,
//         },
//       },
//     });

//     const res = await fetch("/api/turnkey/subOrg", {
//       method: "POST",
//       body: JSON.stringify({
//         subOrgName: subOrgName,
//         attestation,
//         challenge: base64UrlEncode(challenge),
//       }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     const data = await res.json();
//     setSubOrgId(data.subOrgId);
//   };
//   return (
//     <Dialog
//       open={openTurnkeySignInModal}
//       onOpenChange={setOpenTurnkeySignInModal}
//     >
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Sign in with Turnkey</DialogTitle>
//         </DialogHeader>

//         <a
//           href="https://turnkey.com"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="font-mono text-lg"
//         >
//           TurnKey
//         </a>
//         <div>
//           {subOrgId && (
//             <div className="info">
//               Your sub-org ID: <br />
//               <span>{subOrgId}</span>
//             </div>
//           )}
//           {privateKey && (
//             <div>
//               ETH address: <br />
//               <span>{privateKey.address}</span>
//             </div>
//           )}
//           {signedMessage && (
//             <div>
//               Message: <br />
//               <span>{signedMessage.message}</span>
//               <br />
//               <br />
//               Signature: <br />
//               <span>{signedMessage.signature}</span>
//               <br />
//               <br />
//               <a
//                 href="https://etherscan.io/verifiedSignatures"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 Verify with Etherscan
//               </a>
//             </div>
//           )}
//         </div>
//         {!subOrgId && (
//           <div>
//             <h2>First, create a new sub-organization</h2>
//             <p>
//               We&apos;ll prompt your browser to create a new passkey. The details (credential ID, authenticator data,
//               client data, attestation) will be used to create a new{" "}
//               <a
//                 href="https://docs.turnkey.com/getting-started/sub-organizations"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 Turnkey Sub-Organization
//               </a>
//               .
//               <br />
//               <br />
//               This request to Turnkey will be created and signed by the backend API key pair.
//             </p>
//             <form onSubmit={subOrgFormSubmit(createSubOrg)}>
//               <input
//                 type="submit"
//                 value="Create new passkey & sub-org"
//               />
//             </form>
//           </div>
//         )}
//         {subOrgId && !privateKey && (
//           <div>
//             <h2>Next, create a new Ethereum address using your passkey </h2>
//             <p>
//               We will sign the key creation request (
//               <a
//                 href="https://docs.turnkey.com/api#tag/Private-Keys/operation/PublicApiService_CreatePrivateKeys"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 /public/v1/submit/create_private_keys
//               </a>
//               ) with your passkey, and forward it to Turnkey through the NextJS backend.
//               <br />
//               <br />
//               This ensures we can safely poll for activity completion and handle errors.
//             </p>
//             <form onSubmit={privateKeyFormSubmit(createPrivateKey)}>
//               <input
//                 type="submit"
//                 value="Create ETH address"
//               />
//             </form>
//           </div>
//         )}
//         {subOrgId && privateKey && (
//           <div>
//             <h2>Now let&apos;s sign something!</h2>
//             <p>
//               We&apos;ll use a{" "}
//               <a
//                 href="https://viem.sh/docs/accounts/custom.html"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 Viem custom account
//               </a>{" "}
//               to do this, using{" "}
//               <a
//                 href="https://www.npmjs.com/package/@turnkey/viem"
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 @turnkey/viem
//               </a>
//               . You can kill your NextJS server if you want, everything happens on the client-side!
//             </p>
//             <form onSubmit={signingFormSubmit(signMessage)}>
//               <input
//                 {...signingFormRegister("messageToSign")}
//                 placeholder="Write something to sign..."
//               />
//               <input
//                 type="submit"
//                 value="Sign Message"
//               />
//             </form>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };
