import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const CopyButton = ({
  copyValue,
  className,
  onCopy,
  displayText,
}: {
  copyValue: string;
  className?: string;
  onCopy?: () => void;
  displayText?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(copyValue).then(() => {
      onCopy?.();
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [copyValue, onCopy]);
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-7 w-7 p-0", className)}
      onClick={handleCopy}
    >
      {displayText ? <span className="">{displayText}</span> : null}
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};
