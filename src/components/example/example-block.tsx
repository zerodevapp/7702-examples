import React from "react";
import Heading from "../ui/heading";
import { Button } from "../ui/button";
import Link from "next/link";
import CodeBlock, { CodeBlockProps } from "../ui/code";

type ExampleBlockProps = {
  title: string;
  docs: string;
  github: string;
  link: string;
  preview: string;
  example: React.ReactNode;
  index: number;
  codeBlock: Array<CodeBlockProps & { stepTitle?: string }>;
};

const ExampleBlock = ({ index, title, docs, github, link, example, codeBlock }: ExampleBlockProps) => {
  return (
    <section
      id={title.toLowerCase().replace(" ", "-")}
      className="@container flex flex-col gap-4 overflow-clip md:max-h-196"
    >
      <Heading>
        {index}. {title}
      </Heading>

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
          <Link href={github}>GitHub</Link>
        </Button>
        <Button
          asChild
          variant={"outline"}
        >
          <Link href={link}>Copy Link</Link>
        </Button>
        {/* <Button
          asChild
          variant={"outline"}
        >
          <Link href={preview}>Open Preview</Link>
        </Button> */}
      </div>

      {/* slot to display /batching/<example> */}
      <div className="example grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 px-6 @2xl:grid-cols-2">
        <div className="flex h-full flex-col gap-4 overflow-y-auto">
          {codeBlock.map((block) => (
            <div
              key={block.stepTitle}
              className="flex-1"
            >
              <h3>{block.stepTitle}</h3>
              <CodeBlock
                className="h-full"
                {...block}
              />
            </div>
          ))}
        </div>
        <div className="overflow-hidden">{example}</div>
      </div>
    </section>
  );
};

export default ExampleBlock;
