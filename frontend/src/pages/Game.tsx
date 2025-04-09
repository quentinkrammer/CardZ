import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { cn } from "../cn";
import { Button } from "../components/Button";
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
import { getWinningPlayer } from "../utils/getWinningPlayer";

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
      <ViewLastRound />
    </div>
  );
}

function ViewLastRound() {
  const [visible, setVisible] = useState(false);
  const turns = useLastRoundTurns();
  const winningPlayerId = getWinningPlayer(turns ?? []);

  return (
    <>
      <Button
        label={<FontAwesomeIcon icon={faEye} />}
        className={cn(
          "col-start-2 row-start-2 min-w-10 self-end justify-self-end rounded-full",
          visible && "animate-pulse",
        )}
        onClick={() => {
          setVisible((visible) => !visible);
        }}
      />

      {turns?.map((turn, index) => {
        const isWinningCard = turn.playerId === winningPlayerId;
        return (
          <Card
            key={`${turn.turnId}-${index}`}
            cardColor={turn.card.color}
            value={Number(turn.card.value)}
            className={cn(
              "isolate col-start-2 row-start-2",
              cardPositionMap[turns.length]?.[index],
              !visible && "hidden",
            )}
            overlay={
              <div className="self-end justify-self-center font-extrabold text-black backdrop-blur-[1px] backdrop-contrast-50">
                {`#${index + 1} ${isWinningCard ? "WON" : ""}`}
              </div>
            }
            overlayContainerClass="grid"
          />
        );
      })}
    </>
  );
}

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
          ? `card-value-${turn.card.value}-color-${turn.card.color}`
          : `card-turn-${index}-player-${playerId}`;
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
      {activeTurns.map((turn, index) => {
        const playerPosition = sortedPlayers.findIndex(
          (player) => player.playerId === turn.playerId,
        );
        const cardPosition =
          cardPositionMap[sortedPlayers.length]![playerPosition];

        const isMyCard = playerId === turn.playerId;
        const viewTransitionName = isMyCard
          ? `card-value-${turn.card.value}-color-${turn.card.color}`
          : `card-turn-${index}-player-${playerId}`;
        const isLastCardOfRound = index === sortedPlayers.length - 1;

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
