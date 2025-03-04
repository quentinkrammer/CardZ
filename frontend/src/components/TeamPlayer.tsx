import { GameState } from "backend";
import { range } from "lodash";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { useLobbyStore } from "../hooks/useLobbyStore";
import { offsets } from "../offsetToMiddle";

const playerPositionMap: Record<number, Record<number, string>> = {
  3: {
    1: "col-start-1 row-start-1 self-center justify-self-center",
    2: "col-start-3 row-start-1 self-center justify-self-center",
  },
  4: {
    1: "col-start-1 row-start-2 self-center justify-self-center",
    2: "col-start-2 row-start-1 self-center justify-self-center",
    3: "col-start-3 row-start-2 self-center justify-self-center",
  },
};

type TeamPlayerProps = ComponentProps<"div"> & {
  seatNumber: number;
  totalPlayerCount: number;
  playerId: GameState["players"][number]["playerId"];
  className?: string;
};
export function TeamPlayer({
  playerId,
  seatNumber,
  totalPlayerCount,
  className,
}: TeamPlayerProps) {
  const cardCount = useLobbyStore(
    (state) => state.gameState.cardCount[playerId],
  );

  const offsetMultiplier = offsets(range(cardCount));

  return offsetMultiplier.map((multiplier) => {
    const angleDegree = multiplier * 4;
    const xShift = multiplier * 10;
    const yShift = Math.abs(multiplier) * 3;

    return (
      <div
        style={{
          transform: `translate(${xShift}px, ${yShift}px) rotate(${angleDegree}deg)`,
        }}
        className={cn(
          "before:bg-card-backside aspect-[0.82] w-[min(12dvh,10dvw)] rounded-md border-1 border-gray-300 bg-linear-to-br from-gray-700 via-gray-500 to-gray-700 before:block before:size-full before:content-['']",
          playerPositionMap[totalPlayerCount][seatNumber],
          className,
        )}
      />
    );
  });
}
