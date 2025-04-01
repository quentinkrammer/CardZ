import { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

export interface ButtonProps extends ComponentProps<"button"> {
  label?: ReactNode;
}

export function Button({ label, className, ...forwardProps }: ButtonProps) {
  return (
    <button
      className={cn(
        "min-w-20 cursor-pointer rounded bg-blue-600 p-2 hover:bg-blue-500 active:bg-blue-600 disabled:cursor-not-allowed disabled:grayscale-75",
        className,
      )}
      {...forwardProps}
    >
      {label}
    </button>
  );
}
