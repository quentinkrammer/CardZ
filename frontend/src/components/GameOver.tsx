import { useGameStatus, useLobbyStore } from "../hooks/useLobbyStore";
import { useViewContext } from "../hooks/useViewContext";
import { Button } from "./Button";

export function GameOver() {
  const { setView } = useViewContext();
  const isVictory = useLobbyStore((state) =>
    state.gameState.quests.every((quest) => quest.isSuccess),
  );
  const gameStatus = useGameStatus();

  if (gameStatus === "draft" || gameStatus === "ongoing") return;
  return (
    <div className="col-start-2 row-start-2 flex flex-col items-center gap-3">
      <div className="text-2xl font-bold">
        {isVictory ? "Victory" : "Defeat"}
      </div>
      <Button label="Back to lobby" onClick={() => setView("lobby")} />
    </div>
  );
}
