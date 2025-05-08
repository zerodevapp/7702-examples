import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Auth as TurnkeyAuth, useTurnkey } from "@turnkey/sdk-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useAccountProviderContext } from "@/context/account-providers/provider-context";
const TurnkeyUserPill = () => {
  const [signedIn, setSignedIn] = useState(false);
  const queryClient = useQueryClient();
  const { turnkey } = useTurnkey();
  const { embeddedWallet } = useAccountProviderContext();

  const { mutate: signOut, isPending } = useMutation({
    mutationKey: ["sign-out-turnkey"],
    mutationFn: async () => {
      await turnkey?.logout();
      await queryClient.invalidateQueries({ queryKey: ["init-turnkey-account-provider"] });
      setSignedIn(false);
    },
  });

  if (signedIn || embeddedWallet) {
    return (
      <Button
        variant="secondary"
        onClick={() => signOut()}
        disabled={isPending}
      >
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    );
  }
  return (
    <TurnkeyAuth
      authConfig={{
        emailEnabled: true,
        // Set the rest to false to disable them
        passkeyEnabled: false,
        phoneEnabled: false,
        appleEnabled: false,
        facebookEnabled: false,
        googleEnabled: false,
        walletEnabled: false,
      }}
      onAuthSuccess={async () => {
        toast.success("Signed in with Turnkey");
        setSignedIn(true);
        queryClient.invalidateQueries({ queryKey: ["init-turnkey-account-provider"] });
      }}
      onError={(error) => {
        console.error(error);
        toast.error("Error signing in with Turnkey");
      }}
      // The order of the auth methods to display in the UI
      configOrder={["email"]}
    />
  );
};

export default TurnkeyUserPill;
