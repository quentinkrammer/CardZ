import { ReactNode, useEffect, useState } from "react";
import { ViewContext } from "../context/ViewContext";
import { useGameStatus } from "../hooks/useLobbyStore";

export function ViewProvider({ children }: { children: ReactNode }) {
  const gameStatus = useGameStatus();
  const [view, setView] = useState<"lobby" | "game">("lobby");

  const gameIsInitiated = gameStatus === "ongoing" || gameStatus === "draft";

  useEffect(() => {
    if (gameIsInitiated) setView("game");
  }, [gameIsInitiated]);

  return <ViewContext value={{ setView, view }}>{children}</ViewContext>;
}
