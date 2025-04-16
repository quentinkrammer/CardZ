import { ReactNode } from "react";
import { useMyUserData } from "../hooks/useMyUserData";

type EnsureLoginProps = { children: ReactNode };
export function EnsureLogin({ children }: EnsureLoginProps) {
  const { isPending } = useMyUserData();

  if (isPending) return "Loggin in...";

  return children;
}
