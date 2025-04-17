import isNil from "lodash/isNil.js";
import { GameState } from "../drizzle/query/getLatestGameOfLobby.js";
import { getWinningPlayer } from "./getWinningPlayer.js";
import { pick } from "./pick.js";

export function getActivePlayer(gameState: GameState) {
  const draftingPlayer = getDraftingPlayer(
    pick(gameState, "captainsPlayerId", "players", "quests")
  );

  if (draftingPlayer) return draftingPlayer;

  const sortedPlayer = sortPlayerByCaptain(
    pick(gameState, "captainsPlayerId", "players")
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

  const lastRoundWinnerId = getWinningPlayer(lastRoundTurns);
  if (activeCardsCount === 0)
    return sortedPlayer.find((player) => player.playerId === lastRoundWinnerId);

  const lastTurn = gameState.turns.at(-1);
  const lastPlayerId = lastTurn?.playerId;
  return getNextPlayer({ players: gameState.players, lastPlayerId });
}

function getNextPlayer({
  lastPlayerId,
  players, // assumes players are sorted by their number
}: Pick<GameState, "players"> & {
  lastPlayerId: GameState["captainsPlayerId"] | undefined;
}) {
  const lastPlayerIndex = players.findIndex(
    (player) => player.playerId === lastPlayerId
  );
  const nextIndex =
    lastPlayerIndex === players.length - 1 ? 0 : lastPlayerIndex + 1;
  return players[nextIndex];
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
      (quest) => quest.playerId === player.playerId
    ).length;
    const nextPlayerQuestCount = quests.filter(
      (quest) => quest.playerId === nextPlayer?.playerId
    ).length;

    if (playerQuestCount === 0) return player;
    if (playerQuestCount > nextPlayerQuestCount) return nextPlayer;
  }

  return players[0];
}

function sortPlayerByCaptain({
  captainsPlayerId,
  players,
}: Pick<GameState, "players" | "captainsPlayerId">) {
  const indexOfCaptain = players.findIndex(
    (player) => player.playerId === captainsPlayerId
  );

  return [
    ...players.slice(indexOfCaptain),
    ...players.slice(0, indexOfCaptain),
  ];
}
