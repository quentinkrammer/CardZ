import { GameState } from "backend";
import { range } from "lodash";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { useLobbyStore } from "../hooks/useLobbyStore";
import { offsets } from "../offsetToMiddle";
import { Card } from "./Card";
import { CommunicationLabel } from "./CommunicationLabel";
import { Name } from "./Name";
import { Quests } from "./Quests";

const playerPositionMap: Record<number, Record<number, string>> = {
  3: {
    1: "col-start-1 row-start-1",
    2: "col-start-3 row-start-1",
  },
  4: {
    2: "col-start-2 row-start-1",
    1: "col-start-1 row-start-2",
    3: "col-start-3 row-start-2",
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
  const communication = useLobbyStore((state) => {
    const communication = state.gameState.communications.find(
      (communication) => communication.playerId === playerId,
    );

    if (!communication) return;

    const noLongerInHand = state.gameState.turns.some(
      (turn) => turn.card.id === communication.cardId,
    );
    return noLongerInHand ? undefined : communication;
  });

  // todo: why is TSC cli not fondind this
  const offsetMultiplier = offsets(range(cardCount));
  const position = playerPositionMap[totalPlayerCount][seatNumber];

  return (
    <>
      <Name
        playerId={playerId}
        className={cn("self-start justify-self-center p-3", position)}
      />
      <div className="contents">
        {offsetMultiplier.map((multiplier, index, list) => {
          const angleDegree = multiplier * 4;
          const xShift = multiplier * 10;
          const yShift = Math.abs(multiplier) * 3;

          const viewTransitionName =
            index === list.length - 1 ? `card-${playerId}` : undefined;

          const style = {
            transform: `translate(${xShift}px, ${yShift}px) rotate(${angleDegree}deg)`,
            viewTransitionName,
          };

          if (index === list.length - 1 && communication)
            return (
              <Card
                cardColor={communication.cardColor}
                value={Number(communication.cardValue)}
                style={style}
                className={cn(position, className)}
                key={index}
                overlayContainerClass="place-self-center"
                overlay={<CommunicationLabel label={communication.type} />}
              />
            );
          return (
            <div
              key={index}
              style={style}
              className={cn(
                "before:bg-card-backside aspect-[0.82] w-[min(12dvh,10dvw)] self-center justify-self-center rounded-md border-1 border-gray-300 bg-linear-to-br from-gray-700 via-gray-500 to-gray-700 before:block before:size-full",
                position,
                className,
              )}
            />
          );
        })}
      </div>
      <div className="contents">
        {<Quests playerId={playerId} className={position} />}
      </div>
    </>
  );
}
