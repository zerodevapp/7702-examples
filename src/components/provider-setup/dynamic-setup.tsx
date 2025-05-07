import CodeBlocks from "../example/code-blocks";
import { privySetupCode } from "./privy-setup-code";
const PrivySetup = () => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <CodeBlocks codeBlocks={privySetupCode} />
    </div>
  );
};

export default PrivySetup;
