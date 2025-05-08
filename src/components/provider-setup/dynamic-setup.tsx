import CodeBlocks from "../example/code-blocks";
import { dynamicSetupCode } from "./dynamic-setup-code";
const DynamicSetup = () => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <CodeBlocks codeBlocks={dynamicSetupCode} />
    </div>
  );
};

export default DynamicSetup;
