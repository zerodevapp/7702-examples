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
      className="space-y-2"
    >
      {block.stepTitle && <h3 className="">{block.stepTitle}</h3>}
      {block.stepDescription && <p>{block.stepDescription}</p>}
      <CodeBlock
        className="overflow-y-auto"
        {...block}
      />
    </div>
  ));
};

export default CodeBlocks;
