import CodeBlocks from "../example/code-blocks";
import { localSetupCode } from "./local-setup-code";
const LocalSetup = () => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <CodeBlocks codeBlocks={localSetupCode} />
    </div>
  );
};

export default LocalSetup;
