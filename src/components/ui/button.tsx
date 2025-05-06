import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative z-[0] inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // before is pseudo element that is a grid of 1 pixel boxes that fill the button.radial-gradient(black 1px, transparent 0)
        default: cn(
          "bg-background text-primary border-primary border-2",
          "before:absolute before:inset-0 before:z-[-1] before:h-full before:w-full before:bg-[radial-gradient(#00000010_1px,transparent_1px)] before:[background-size:8px_8px] before:opacity-0 before:transition-opacity hover:before:opacity-100",
          "hover:shadow-primary hover:shadow-[3px_3px_0_0_var(--tw-shadow-color)]",
        ),
        cta: cn(
          "bg-primary/25 text-primary border-primary border-2",
          "hover:shadow-primary hover:shadow-[3px_3px_0_0_var(--tw-shadow-color)]",
        ),
        active: cn(
          "bg-background text-primary border-primary border-2",
          "before:absolute before:inset-0 before:z-[-1] before:h-full before:w-full before:bg-white before:bg-[radial-gradient(#00000010_1px,transparent_1px)] before:[background-size:8px_8px]",
          "shadow-primary shadow-[3px_3px_0_0_var(--tw-shadow-color)]",
        ),
        destructive:
          "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: cn(
          "bg-background text-primary border-primary border-2",
          "before:absolute before:inset-0 before:z-[-1] before:h-full before:w-full before:bg-[radial-gradient(#00000010_1px,transparent_1px)] before:[background-size:8px_8px] before:opacity-0 before:transition-opacity hover:before:opacity-100",
          "hover:shadow-primary hover:shadow-[3px_3px_0_0_var(--tw-shadow-color)]",
        ),
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 py-2 has-[>svg]:px-3",
        sm: "h-10 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-14 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
