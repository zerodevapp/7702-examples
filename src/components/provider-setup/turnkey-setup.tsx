import CodeBlocks from "../example/code-blocks";
import { turnkeySetupCode } from "./turnkey-setup-code";
const TurnkeySetup = () => {
  return (
    <div className="flex flex-col gap-4">
      <CodeBlocks codeBlocks={turnkeySetupCode} />
    </div>
  );
};

export default TurnkeySetup;
