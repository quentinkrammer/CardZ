import { useContext } from "react";
import { ViewContext } from "../context/ViewContext";

export function useViewContext() {
  const context = useContext(ViewContext);

  if (!context)
    throw new Error("useViewContext must be used inside ViewContext!");
  return context;
}
