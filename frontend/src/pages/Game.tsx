import { cn } from "../cn";
import { Card } from "../components/Card";
import { MyHand } from "../components/MyHand";
import { Quest } from "../components/Quest";
import { TeamPlayer } from "../components/TeamPlayer";
import { getValueAndColorFromQuestId } from "../getValueAndColorFromQuestId";
import { useActivePlayer } from "../hooks/useActivePlayer";
import { useActiveTurns } from "../hooks/useActiveTurns";
import { useLastRoundTurns } from "../hooks/useLastRoundTurns";
import { useNonDraftedQuests } from "../hooks/useLobbyStore";
import { useMyPlayerId } from "../hooks/useMyPlayerId";
import { usePlayerSortedByPosition } from "../hooks/usePlayerSortedByPosition";
import { useLobbyId } from "../hooks/useUrlParams";
import { trpc } from "../trpc";

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
  return <OpenCards />;
}

function OpenCards() {
  const sortedPlayers = usePlayerSortedByPosition();
  const activeTurns = useActiveTurns();
  const playerId = useMyPlayerId();
  const lastRoundTurns = useLastRoundTurns();
  const hasActiveTurns = activeTurns.length > 0;

  console.log({ activeTurns, lastRoundTurns });
  return (
    <div className="contents">
      {lastRoundTurns?.map((turn, index, list) => {
        const playerPosition = sortedPlayers.findIndex(
          (player) => player.playerId === turn.playerId,
        );
        const cardPosition =
          cardPositionMap[sortedPlayers.length]![playerPosition];

        const isMyCard = playerId === turn.playerId;
        const viewTransitionName = isMyCard
          ? `card-${turn.card.value}-${turn.card.color}`
          : `card-${playerId}`;
        const isLastCardOfRound = index === list.length - 1;

        return (
          <Card
            cardColor={turn.card.color}
            value={Number(turn.card.value)}
            key={`cardId-${turn.card.id}`}
            className={cn(
              "col-start-2 row-start-2 opacity-0 transition-opacity delay-200 duration-[2s] ease-in",
              hasActiveTurns || "starting:opacity-100",
              cardPosition,
            )}
            style={{
              viewTransitionName: isLastCardOfRound
                ? viewTransitionName
                : undefined,
            }}
          />
        );
      })}
      {activeTurns.map((turn, index, list) => {
        const playerPosition = sortedPlayers.findIndex(
          (player) => player.playerId === turn.playerId,
        );
        const cardPosition =
          cardPositionMap[sortedPlayers.length]![playerPosition];

        const isMyCard = playerId === turn.playerId;
        const viewTransitionName = isMyCard
          ? `card-${turn.card.value}-${turn.card.color}`
          : `card-${playerId}`;
        const isLastCardOfRound = index === list.length - 1;

        return (
          <Card
            cardColor={turn.card.color}
            value={Number(turn.card.value)}
            key={turn.turnId}
            className={cn("isolate col-start-2 row-start-2", cardPosition)}
            style={{
              viewTransitionName: isLastCardOfRound
                ? undefined
                : viewTransitionName,
            }}
          />
        );
      })}
    </div>
  );
}
