import { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

export type InputProps = ComponentProps<"input"> & {
  rightElement?: ReactNode;
  leftElement?: ReactNode;
};
export function Input({
  rightElement,
  leftElement,
  className,
  ...forwardProps
}: InputProps) {
  return (
    <div className="flex rounded border-1 border-transparent bg-gray-900 hover:bg-gray-800 has-[:focus-visible]:border-white">
      {leftElement}
      <input
        className={cn("min-w-40 grow-1 rounded p-2 focus:outline-0", className)}
        {...forwardProps}
      />
      {rightElement}
    </div>
  );
}
