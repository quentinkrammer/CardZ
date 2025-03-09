import classNames from "classnames";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../cn";
import { Card } from "../components/Card";
import { Quest } from "../components/Quest";
import { TeamPlayer } from "../components/TeamPlayer";
import { useActivePlayer } from "../hooks/useActivePlayer";
import { useActiveTurns } from "../hooks/useActiveTurns";
import { useIsCaptain } from "../hooks/useIsCaptain";
import { useLobbyStore, useNonDraftedQuests } from "../hooks/useLobbyStore";
import { useMyPlayerId } from "../hooks/useMyPlayerId";
import { usePlayerSortedByPosition } from "../hooks/usePlayerSortedByPosition";
import { useLobbyId } from "../hooks/useUrlParams";
import { offsetToMiddle } from "../offsetToMiddle";
import { trpc } from "../trpc";
import { Color } from "../types";

export function Game() {
  const player = usePlayerSortedByPosition();

  return (
    <div className="grid h-full grid-cols-[30dvw_40dvw_30dvw] grid-rows-[33%_34%_33%] place-items-center">
      {player.map(({ playerId }, index) => {
        if (index === 0) return;
        return (
          <TeamPlayer
            playerId={playerId}
            seatNumber={index}
            totalPlayerCount={player.length}
            key={playerId}
          />
        );
      })}
      <PlayArea />
      <MyHand />
    </div>
  );
}

const borderColorToTailwindClassMap: Record<Color, string> = {
  black: "hover:border-gray-600 ",
  blue: "hover:border-sky-600",
  green: "hover:border-green-600",
  orange: "hover:border-orange-600",
  red: "hover:border-rose-600",
};

function MyHand() {
  const cards = useLobbyStore(
    useShallow((state) =>
      state.gameState.cards.toSorted((a, b) => a.id - b.id),
    ),
  );
  const playerId = useMyPlayerId();
  const isCaptain = useIsCaptain(playerId);
  const lobbyId = useLobbyId();
  const activePlayer = useActivePlayer();
  const playCard = trpc.game.playCard.useMutation();

  const onCard = (cardId: number) => {
    if (playerId !== activePlayer?.playerId)
      return console.warn("It's not your turn");
    playCard.mutate({ cardId, lobbyId });
  };

  return (
    <>
      {isCaptain && (
        <div className="col-start-2 row-start-3 self-start justify-self-start">
          Captain
        </div>
      )}
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
              }}
            />
          );
        })}
      </div>
    </>
  );
}

const cardPositionMap: Record<number, Record<number, string>> = {
  3: {
    0: "self-end justify-self-center",
    1: "self-start justify-self-start",
    2: "self-start justify-self-end",
  },
  4: {
    0: "self-end justify-self-center",
    1: "self-center justify-self-start",
    2: "self-start justify-self-center",
    3: "self-center justify-self-end",
  },
};
function PlayArea() {
  const quest = useNonDraftedQuests();
  const activePlayer = useActivePlayer();
  const playerId = useMyPlayerId();
  const lobbyId = useLobbyId();
  const pickQuest = trpc.game.pickQuest.useMutation();
  const sortedPlayers = usePlayerSortedByPosition();
  const activeTurns = useActiveTurns();

  const onQuest = (questId: string) => {
    if (playerId !== activePlayer?.playerId)
      return console.warn("It's not your turn");
    pickQuest.mutate({ lobbyId, questId });
  };

  const isDraftingPhase = quest.length > 0;

  if (isDraftingPhase)
    return (
      <div className="col-start-2 row-start-2 flex h-full w-full flex-wrap items-center justify-evenly">
        {quest.map(({ questId }) => {
          const { color, value } = getValueAndColorFromQuestId(questId);
          return (
            <Quest
              value={value}
              cardColor={color}
              key={questId}
              onDoubleClick={() => onQuest(questId)}
            />
          );
        })}
      </div>
    );
  return activeTurns.map((turn) => {
    const playerPosition = sortedPlayers.findIndex(
      (player) => player.playerId === turn.playerId,
    );
    const cardPosition = cardPositionMap[sortedPlayers.length][playerPosition];
    return (
      <Card
        cardColor={turn.card.color}
        value={Number(turn.card.value)}
        key={turn.turnId}
        className={cn("col-start-2 row-start-2", cardPosition)}
      />
    );
  });
}

function getValueAndColorFromQuestId(questId: string) {
  const [color, value] = questId.split("-");

  // TODO: use zod parser
  return { color: color as Color, value: Number(value) };
}
