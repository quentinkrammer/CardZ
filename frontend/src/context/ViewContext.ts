import { createContext } from "react";

type View = "game" | "lobby";
export const ViewContext = createContext<{
  view: View;
  setView: (view: View) => void;
} | null>(null);
