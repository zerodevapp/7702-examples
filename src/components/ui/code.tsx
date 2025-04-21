"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
export interface PackageManager {
  type: string;
  command: string;
}

export interface CodeFile {
  name: string;
  language?: string;
  content: string;
}

type CodeBlockProps =
  | {
      type: "files" | undefined;
      files: CodeFile[];
    }
  | {
      type: "command";
      packageManagers: PackageManager[];
    };

function CodeBlock({ ...props }: CodeBlockProps) {
  if (props.type === "command") {
    return (
      <div className={cn("relative")}>
        <PackageTabs packageManagers={props.packageManagers} />
      </div>
    );
  }

  return (
    <div className={cn("relative")}>
      <FileTabs files={props.files} />
    </div>
  );
}

const PackageTabs = ({ packageManagers }: { packageManagers: PackageManager[] }) => {
  const [selectedPackage, setSelectedPackage] = useLocalStorage("package-manager", packageManagers[0].command);

  return (
    <Tabs
      defaultValue={selectedPackage}
      className="bg-background border-primary/10 w-full gap-0 border-2"
      onValueChange={(value) => setSelectedPackage(value)}
    >
      <TabsList className="bg-background border-primary/10 w-full justify-start gap-0 border-0 border-b-2 p-0">
        {packageManagers.map((pm) => (
          <TabsTrigger
            key={pm.type}
            value={pm.type}
            className="data-[state=active]:bg-primary/10 group hover:bg-primary/10 data-[state=active]:text-primary relative h-full max-w-fit cursor-pointer text-xs"
          >
            <div className="active bg-primary absolute bottom-0 left-0 h-0.5 w-full opacity-0 transition-all duration-300 group-data-[state=active]:opacity-100"></div>
            {pm.type}
          </TabsTrigger>
        ))}
        <CopyButton
          className="mr-1 ml-auto"
          content={packageManagers.find((pm) => pm.type === selectedPackage)?.command || ""}
        />
      </TabsList>

      {packageManagers.map((pm) => (
        <TabsContent
          key={pm.type}
          value={pm.type}
        >
          <pre className="overflow-auto p-4 text-sm">
            <code className={`language-bash`}>{pm.command}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};

const FileTabs = ({ files }: { files: CodeFile[] }) => {
  const [selectedFile, setSelectedFile] = useState(files[0].name);

  return (
    <Tabs
      defaultValue={selectedFile}
      className="bg-background border-primary/10 w-full gap-0 border-2"
      onValueChange={(value) => setSelectedFile(value)}
    >
      <TabsList className="bg-background border-primary/10 w-full justify-start gap-0 border-0 border-b-2 p-0">
        {files.map((file) => (
          <TabsTrigger
            key={file.name}
            value={file.name}
            className="data-[state=active]:bg-primary/10 group hover:bg-primary/10 data-[state=active]:text-primary relative h-full max-w-fit cursor-pointer text-xs"
          >
            <div className="active bg-primary absolute bottom-0 left-0 h-0.5 w-full opacity-0 transition-all duration-300 group-data-[state=active]:opacity-100"></div>
            {file.name}
          </TabsTrigger>
        ))}
        <CopyButton
          className="mr-1 ml-auto"
          content={files.find((file) => file.name === selectedFile)?.content || ""}
        />
      </TabsList>

      {files.map((file) => (
        <TabsContent
          key={file.name}
          value={file.name}
        >
          <pre className="overflow-auto p-4 text-sm">
            <code className={file.language ? `language-${file.language}` : ""}>{file.content}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};

const CopyButton = ({ content, className }: { content: string; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-7 w-7 p-0", className)}
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

export default CodeBlock;
