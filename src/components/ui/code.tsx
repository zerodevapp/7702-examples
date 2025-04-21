"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useCallback, useState, ReactNode } from "react";
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

export function CodeBlock({ ...props }: CodeBlockProps) {
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

// Simple wrapper for backward compatibility
const Code = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <pre className={cn("border-border bg-secondary/30 border-x border-b p-2", className)}>
      <code>{children}</code>
    </pre>
  );
};

const PackageTabs = ({ packageManagers }: { packageManagers: PackageManager[] }) => {
  const [selectedPackage, setSelectedPackage] = useLocalStorage(packageManagers[0].type, packageManagers[0].command);
  const [copied, setCopied] = useState(false);
  // Copy handler
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(packageManagers.find((pm) => pm.type === selectedPackage)?.command || "").then(() => {
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [packageManagers, selectedPackage]);

  return (
    <Tabs
      defaultValue={selectedPackage}
      className="bg-background border-primary w-full border-2"
      onValueChange={(value) => setSelectedPackage(value)}
    >
      <TabsList className="bg-background border-primary w-full justify-start border-0 border-b-2">
        {packageManagers.map((pm) => (
          <TabsTrigger
            key={pm.type}
            value={pm.type}
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary h-7 max-w-fit cursor-pointer text-xs"
          >
            {pm.type}
          </TabsTrigger>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-7 w-7 p-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </TabsList>

      {packageManagers.map((pm) => (
        <TabsContent
          key={pm.type}
          value={pm.type}
        >
          <pre className="border-border bg-secondary/30 overflow-auto border-x border-b p-4 text-sm">
            <code className={`language-bash`}>{pm.command}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};

const FileTabs = ({ files }: { files: CodeFile[] }) => {
  const [selectedFile, setSelectedFile] = useState(files[0].name);
  const [copied, setCopied] = useState(false);
  // Copy handler
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(files.find((file) => file.name === selectedFile)?.content || "").then(() => {
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [files, selectedFile]);

  return (
    <Tabs
      defaultValue={selectedFile}
      className="bg-background border-primary w-full border-2"
      onValueChange={(value) => setSelectedFile(value)}
    >
      <TabsList className="bg-background border-primary w-full justify-start border-0 border-b-2">
        {files.map((file) => (
          <TabsTrigger
            key={file.name}
            value={file.name}
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary h-7 max-w-fit cursor-pointer text-xs"
          >
            {file.name}
          </TabsTrigger>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-7 w-7 p-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </TabsList>

      {files.map((file) => (
        <TabsContent
          key={file.name}
          value={file.name}
        >
          <pre className="border-border bg-secondary/30 overflow-auto border-x border-b p-4 text-sm">
            <code className={file.language ? `language-${file.language}` : ""}>{file.content}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Code;
