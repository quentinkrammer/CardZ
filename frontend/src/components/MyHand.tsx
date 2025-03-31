import classNames from "classnames";
import { isNil } from "lodash";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../cn";
import { useActivePlayer } from "../hooks/useActivePlayer";
import { useLobbyStore } from "../hooks/useLobbyStore";
import { useMyPlayerId } from "../hooks/useMyPlayerId";
import { useLobbyId } from "../hooks/useUrlParams";
import { offsetToMiddle } from "../offsetToMiddle";
import { trpc } from "../trpc";
import { Color } from "../types";
import { Card } from "./Card";
import { Name } from "./Name";
import { Quests } from "./Quests";

const borderColorToTailwindClassMap: Record<Color, string> = {
  black: "hover:border-gray-600 ",
  blue: "hover:border-sky-600",
  green: "hover:border-green-600",
  orange: "hover:border-orange-600",
  red: "hover:border-rose-600",
};

export function MyHand() {
  const cards = useLobbyStore(
    useShallow((state) =>
      state.gameState.cards.toSorted((a, b) => a.id - b.id),
    ),
  );
  const playerId = useMyPlayerId();
  const lobbyId = useLobbyId();
  const activePlayer = useActivePlayer();
  const playCard = trpc.game.playCard.useMutation();

  const onCard = (cardId: number) => {
    if (playerId !== activePlayer?.playerId)
      return console.warn("It's not your turn");
    playCard.mutate({ cardId, lobbyId });
  };

  if (isNil(playerId)) return;
  return (
    <>
      {
        <Name
          playerId={playerId}
          className="col-start-2 row-start-3 self-start justify-self-start"
        />
      }
      <div
        className={classNames(
          "relative col-start-2 row-start-3 self-end justify-self-center",
        )}
      >
        {cards.map((card, index) => {
          const offset = offsetToMiddle(cards, index);

          return (
            <Card
              cardColor={card.color}
              value={Number(card.value)}
              onDoubleClick={() => onCard(card.id)}
              key={card.id}
              className={cn(
                "absolute cursor-pointer hover:z-10",
                borderColorToTailwindClassMap[card.color],
              )}
              style={{
                bottom: 0,
                translate: `calc(min(12dvh, 10dvw) * -0.5 + ${offset} * min(12dvh, 10dvw) / 1.7)`,
                viewTransitionName: `card-${card.value}-${card.color}`,
              }}
            />
          );
        })}
      </div>
      <Quests
        playerId={playerId}
        className="col-start-2 row-start-3 self-start justify-self-center"
      />
    </>
  );
}
