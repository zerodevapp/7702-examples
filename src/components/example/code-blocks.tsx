import React from "react";
import CodeBlock, { CodeBlockProps } from "../ui/code";

const CodeBlocks = ({
  codeBlocks,
}: {
  codeBlocks: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }>;
}) => {
  return codeBlocks.map((block, index) => (
    <div
      key={index}
      className="flex-1 space-y-2 overflow-y-auto"
    >
      {block.stepTitle && <h3 className="font-semibold">{block.stepTitle}</h3>}
      {block.stepDescription && <p>{block.stepDescription}</p>}
      <CodeBlock
        className="h-full overflow-y-auto"
        {...block}
      />
    </div>
  ));
};

export default CodeBlocks;
