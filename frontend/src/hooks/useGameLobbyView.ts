import { useEffect, useState } from "react";
import { useGameIsOngoing } from "./useLobbyStore";

export function useGameLobbyView() {
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
