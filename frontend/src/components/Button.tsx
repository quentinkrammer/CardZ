import { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

interface ButtonProps extends ComponentProps<"button"> {
  label: ReactNode;
}

export function Button({ label, className, ...forwardProps }: ButtonProps) {
  return (
    <button
      className={cn(
        "hover:text-shadow min-w-20 cursor-pointer rounded bg-blue-600 p-2 hover:bg-blue-500 active:bg-blue-600",
        className,
      )}
      {...forwardProps}
    >
      {label}
    </button>
  );
}
