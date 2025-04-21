import { cn } from "@/lib/utils";
import React from "react";

interface HeadingProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  variant?: "primary" | "secondary";
}

const Heading = ({ children, className, as = "h1", variant = "primary" }: HeadingProps) => {
  const Comp = as;
  return (
    <Comp className={cn("relative mb-6")}>
      <span className={cn("bg-background ml-4 px-2 font-mono text-2xl tracking-wide", className)}>{children}</span>
      <span
        className={cn(
          "bg-primary absolute top-1/2 left-0 z-[-1] h-0.5 w-full -translate-y-1/2",
          variant === "primary" ? "visible" : "invisible",
        )}
      ></span>
    </Comp>
  );
};

export default Heading;
