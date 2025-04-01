import { GameState } from "backend";
import classNames from "classnames";
import { isNil } from "lodash";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../cn";
import { useActivePlayer } from "../hooks/useActivePlayer";
import { useActiveTurns } from "../hooks/useActiveTurns";
import { useCommuniationOverlayStore } from "../hooks/useCommuniationOverlayStore";
import { useLobbyStore, useNonDraftedQuests } from "../hooks/useLobbyStore";
import { useMyPlayerId } from "../hooks/useMyPlayerId";
import { useLobbyId } from "../hooks/useUrlParams";
import { offsetToMiddle } from "../offsetToMiddle";
import { trpc } from "../trpc";
import { Color } from "../types";
import { Button } from "./Button";
import { Card, CardProps } from "./Card";
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
  const isDraftingPhase = useNonDraftedQuests().length > 0;
  const activeTurns = useActiveTurns();

  const onCard = (card: GameState["cards"][number]) => {
    if (playerId !== activePlayer?.playerId)
      return console.warn("It's not your turn");
    if (isDraftingPhase) return console.warn("It's drafting phase.");

    const firstCardOfRound = activeTurns[0]?.card;
    const isFirstCard = !firstCardOfRound;
    const mustAbideColor = isFirstCard
      ? false
      : cards.some((c) => c.color === firstCardOfRound.color);

    const cardIsPlayable =
      !mustAbideColor || card.color === firstCardOfRound?.color;

    if (!cardIsPlayable) return console.log("Card is not playable.");

    playCard.mutate({ cardId: card.id, lobbyId });
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
              onDoubleClick={() => onCard(card)}
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
              overlayContainerClass="place-self-center"
              overlay={
                <CommunicationOverlay
                  cardColor={card.color}
                  value={Number(card.value)}
                />
              }
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

type CommunicationOverlayProps = Pick<CardProps, "value" | "cardColor">;
function CommunicationOverlay({ cardColor, value }: CommunicationOverlayProps) {
  const overlayIsActive = useCommuniationOverlayStore(
    (state) => state.isActive,
  );

  if (!overlayIsActive) return;
  return (
    <Button
      label="single"
      className="min-w-0 opacity-80 drop-shadow-none hover:opacity-100 hover:drop-shadow-[1px_1px_1px_rgba(0,0,0)] active:drop-shadow-none"
    />
  );
}
