// "use server";

// import { Turnkey } from "@turnkey/sdk-server";
// import { turnkeyConfig } from "@/constants/turnkey";

// const { apiBaseUrl, defaultOrganizationId } = turnkeyConfig;

// // Initialize the Turnkey Server Client on the server-side
// const turnkeyServer = new Turnkey({
//   apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
//   apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
//   apiBaseUrl,
//   defaultOrganizationId,
// }).apiClient();

// export const getSubOrg = async (publicKey: string) => {
//   const { organizationIds } = await turnkeyServer.getSubOrgIds({
//     // The parent organization ID
//     organizationId: turnkeyConfig.defaultOrganizationId,
//     filterType: "PUBLIC_KEY",
//     filterValue: publicKey,
//   });

//   return organizationIds[0];
// };
