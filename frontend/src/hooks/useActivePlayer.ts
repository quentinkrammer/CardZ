import { GameState } from "backend";
import { isNil } from "lodash";
import { useShallow } from "zustand/react/shallow";
import { pick } from "../utils/pick";
import { useLobbyStore } from "./useLobbyStore";
import { sortPlayerByCaptain } from "./usePlayerSortedByCaptain";

export function useActivePlayer() {
  return useLobbyStore(
    useShallow(({ gameState }) => {
      const draftingPlayer = getDraftingPlayer(
        pick(gameState, "captainsPlayerId", "players", "quests"),
      );

      if (draftingPlayer) return draftingPlayer;

      const sortedPlayer = sortPlayerByCaptain(
        pick(gameState, "captainsPlayerId", "players"),
      );

      const cardsPlayed = gameState.turns.length;
      const playerCount = sortedPlayer.length;
      const activeCardsCount = cardsPlayed % playerCount;
      if (cardsPlayed < gameState.players.length) {
        return sortedPlayer[activeCardsCount];
      }

      const start = -1 * (playerCount + activeCardsCount);
      const end = start + playerCount;
      const lastRoundTurns =
        activeCardsCount === 0
          ? gameState.turns.slice(-1 * playerCount)
          : gameState.turns.slice(start, end);
      const lastRoundCards = lastRoundTurns.map((turn) => ({
        ...turn.card,
        playerId: turn.playerId,
      }));

      const lastRoundWinnerId = getWinningPlayer(lastRoundCards);
      if (activeCardsCount === 0)
        return sortedPlayer.find(
          (player) => player.playerId === lastRoundWinnerId,
        );

      const lastTurn = gameState.turns.at(-1)!;
      const lastPlayerId = lastTurn.playerId;
      return getNextPlayer({ players: gameState.players, lastPlayerId });
    }),
  );
}

function getNextPlayer({
  lastPlayerId,
  players, // assumes players are sorted by their number
}: Pick<GameState, "players"> & {
  lastPlayerId: GameState["captainsPlayerId"];
}) {
  const lastPlayerIndex = players.findIndex(
    (player) => player.playerId === lastPlayerId,
  );
  const nextIndex =
    lastPlayerIndex === players.length - 1 ? 0 : lastPlayerIndex + 1;
  return players[nextIndex];
}

function getWinningPlayer(cards: GameState["cards"]) {
  const winningCard = cards.reduce((prev, curr) => {
    // sticht mit trumpf
    if (curr.color === "black" && prev.color !== "black") return curr;
    // farbe nicht bedient
    if (curr.color !== prev.color) return prev;
    // nummer ist niedriger
    if (curr.value < prev.value) return prev;
    return curr;
  }, cards[0]);
  return winningCard.playerId;
}

function getDraftingPlayer({
  players,
  quests,
  captainsPlayerId,
}: Pick<GameState, "players" | "quests" | "captainsPlayerId">) {
  const isDraftOngoing = quests.some((quest) => isNil(quest.playerId));
  if (!isDraftOngoing) return;

  const sortedPlayer = sortPlayerByCaptain({ captainsPlayerId, players });

  for (const player of sortedPlayer) {
    const nextPlayer = getNextPlayer({
      players: sortedPlayer,
      lastPlayerId: player.playerId,
    });

    const playerQuestCount = quests.filter(
      (quest) => quest.playerId === player.playerId,
    ).length;
    const nextPlayerQuestCount = quests.filter(
      (quest) => quest.playerId === nextPlayer.playerId,
    ).length;

    if (playerQuestCount === 0) return player;
    if (playerQuestCount > nextPlayerQuestCount) return nextPlayer;
  }

  return players[0];
}
