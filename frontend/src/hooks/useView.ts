import { useEffect, useState } from "react";
import { useGameIsOngoing } from "./useLobbyStore";

export function useView() {
  const gameIsOngoing = useGameIsOngoing();
  const [view, setView] = useState<"lobby" | "game">(() => {
    if (gameIsOngoing) return "game";
    return "lobby";
  });

  useEffect(() => {
    if (gameIsOngoing) setView("game");
  }, [gameIsOngoing]);

  return { view, setView };
}
