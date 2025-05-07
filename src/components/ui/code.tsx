"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useLocalStorage } from "usehooks-ts";
import { CopyButton } from "./copy-button";

export interface Command {
  type: string;
  command: string;
}

export interface CodeFile {
  name: string;
  language?: string;
  content: string;
}

export type CodeBlockProps =
  | {
      type: "files" | undefined;
      files: CodeFile[];
      className?: string;
    }
  | {
      type: "command";
      packageManagers: Command[];
      className?: string;
    };

function CodeBlock({ ...props }: CodeBlockProps) {
  if (props.type === "command") {
    return (
      <PackageTabs
        className={props.className}
        packageManagers={props.packageManagers}
      />
    );
  }

  return (
    <FileTabs
      className={props.className}
      files={props.files}
    />
  );
}

const PackageTabs = ({ packageManagers, className }: { packageManagers: Command[]; className?: string }) => {
  const [selectedPackage, setSelectedPackage] = useLocalStorage("package-manager", packageManagers[0].type || "npm");

  return (
    <Tabs
      defaultValue={selectedPackage}
      className={cn("bg-background border-primary/10 relative w-full gap-0 border-2", className)}
      onValueChange={(value) => setSelectedPackage(value)}
    >
      <TabsList className="bg-background border-primary/10 h-fit w-full justify-start gap-0 border-0 border-b-2 p-0">
        {packageManagers.map((pm) => (
          <TabsTrigger
            key={pm.type}
            value={pm.type}
            className="data-[state=active]:bg-primary/10 group hover:bg-primary/10 data-[state=active]:text-primary relative h-10 max-w-fit cursor-pointer text-xs"
          >
            <div className="active bg-primary absolute bottom-0 left-0 h-0.5 w-full opacity-0 transition-all duration-300 group-data-[state=active]:opacity-100"></div>
            {pm.type}
          </TabsTrigger>
        ))}
        <CopyButton
          className="mr-1 ml-auto"
          copyValue={packageManagers.find((pm) => pm.type === selectedPackage)?.command || ""}
        />
      </TabsList>

      {packageManagers.map((pm) => (
        <TabsContent
          key={pm.type}
          value={pm.type}
        >
          <pre className="h-full max-h-[500px] overflow-auto p-4 text-sm">
            <code className={`language-bash`}>{pm.command}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};

const FileTabs = ({ files, className }: { files: CodeFile[]; className?: string }) => {
  const [selectedFile, setSelectedFile] = useState(files[0].name);

  return (
    <Tabs
      defaultValue={selectedFile}
      className={cn("bg-background border-primary/10 relative w-full gap-0 border-2", className)}
      onValueChange={(value) => setSelectedFile(value)}
    >
      <TabsList className="bg-background border-primary/10 h-fit w-full justify-start gap-0 border-0 border-b-2 p-0">
        {files.map((file) => (
          <TabsTrigger
            key={file.name}
            value={file.name}
            className="data-[state=active]:bg-primary/10 group hover:bg-primary/10 data-[state=active]:text-primary relative h-10 max-w-fit cursor-pointer text-xs"
          >
            <div className="active bg-primary absolute bottom-0 left-0 h-0.5 w-full opacity-0 transition-all duration-300 group-data-[state=active]:opacity-100"></div>
            {file.name}
          </TabsTrigger>
        ))}
        <CopyButton
          className="mr-1 ml-auto"
          copyValue={files.find((file) => file.name === selectedFile)?.content || ""}
        />
      </TabsList>

      {files.map((file) => (
        <TabsContent
          key={file.name}
          value={file.name}
          className="mt-0 max-h-[500px] overflow-auto"
        >
          <SyntaxHighlighter
            language={file.language}
            style={docco}
            PreTag={(props) => (
              <pre
                {...props}
                style={{
                  ...props.style,
                  padding: "0.75rem",
                }}
                className="text-sm"
              />
            )}
            CodeTag={(props) => (
              <code
                {...props}
                className="text-sm"
              />
            )}
          >
            {file.content}
          </SyntaxHighlighter>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CodeBlock;
