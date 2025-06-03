import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { CodeBlockProps } from "../ui/code";
import Heading from "../ui/heading";
import CodeBlocks from "./code-blocks";
type ExampleBlockProps = {
  title: string;
  docs: string;
  github: string;
  description: React.ReactNode;
  example: React.ReactNode;
  index: number;
  codeBlock: Array<CodeBlockProps & { stepTitle?: string; stepDescription?: string }>;
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
      <div className="example grid flex-1 grid-cols-1 gap-4 p-4 px-6 @3xl:grid-cols-2">
        <div className="flex flex-col gap-4 overflow-hidden">
          <CodeBlocks codeBlocks={codeBlock} />
        </div>
        <div className="overflow-hidden">{example}</div>
      </div>

      <div className="space-x-4 px-6">
        <Button
          asChild
          variant={"outline"}
        >
          <Link
            href={docs}
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </Link>
        </Button>
        <Button
          asChild
          variant={"outline"}
        >
          <Link
            href={github}
            target="_blank"
            rel="noopener noreferrer"
          >
            Code
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default ExampleBlock;
