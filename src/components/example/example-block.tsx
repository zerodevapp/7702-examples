import React from "react";
import Heading from "../ui/heading";
import { Button } from "../ui/button";
import Link from "next/link";
type ExampleBlockProps = {
  title: string;
  docs: string;
  github: string;
  link: string;
  preview: string;
  example: React.ReactNode;
  index: number;
};

const ExampleBlock = ({ index, title, docs, github, link, preview, example }: ExampleBlockProps) => {
  return (
    <section
      id={title.toLowerCase().replace(" ", "-")}
      className="flex h-screen max-h-256 flex-col gap-4"
    >
      <Heading>
        {index}. {title}
      </Heading>

      <div className="space-x-4 px-8">
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
        <Button
          asChild
          variant={"outline"}
        >
          <Link href={preview}>Open Preview</Link>
        </Button>
      </div>

      {/* slot to display /batching/<example> */}

      <div className="w-full flex-1 p-4">{example}</div>
    </section>
  );
};

export default ExampleBlock;
