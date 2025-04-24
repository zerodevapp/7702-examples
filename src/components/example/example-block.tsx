import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import CodeBlock, { CodeBlockProps } from "../ui/code";
import Heading from "../ui/heading";

type ExampleBlockProps = {
  title: string;
  docs: string;
  github: string;
  description: React.ReactNode;
  example: React.ReactNode;
  index: number;
  codeBlock: Array<CodeBlockProps & { stepTitle?: string }>;
};

const ExampleBlock = ({ index, title, docs, github, description, example, codeBlock }: ExampleBlockProps) => {
  return (
    <section
      id={title.toLowerCase().replace(" ", "-")}
      className="@container flex flex-col gap-4"
    >
      <Heading>
        {index}. {title}
      </Heading>

      {description}

      {/* slot to display /batching/<example> */}
      <div className="example grid flex-1 grid-cols-1 gap-4 p-4 px-6 @2xl:grid-cols-2">
        <div className="flex max-h-128 flex-col gap-4 overflow-hidden">
          {codeBlock.map((block, index) => (
            <div
              key={index}
              className="flex-1 overflow-y-auto"
            >
              <h3>{block.stepTitle}</h3>
              <CodeBlock
                className="h-full overflow-y-auto"
                {...block}
              />
            </div>
          ))}
        </div>
        <div className="overflow-hidden">{example}</div>
      </div>

      <div className="space-x-4 px-6">
        <Button
          asChild
          variant={"outline"}
        >
          <Link href={docs}>Docs</Link>
        </Button>
        <Button
          asChild
          variant={"outline"}
        >
          <Link href={github}>Full Code</Link>
        </Button>
      </div>
    </section>
  );
};

export default ExampleBlock;
