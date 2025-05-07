import CodeBlocks from "../example/code-blocks";
import { localSetupCode } from "./code";
const PrivySetup = () => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <CodeBlocks codeBlocks={localSetupCode} />
    </div>
  );
};

export default PrivySetup;
