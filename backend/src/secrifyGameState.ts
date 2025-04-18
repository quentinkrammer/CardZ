import isNil from "lodash/isNil.js";
import { SelectUser } from "./drizzle/schema.js";
import { type GameState } from "./types.js";

export function secrifyGameState({
  game,
  userId,
}: {
  game: GameState;
  userId: SelectUser["id"];
}): GameState {
  const playerId = game.players.find(
    (player) => player.userId === userId
  )?.playerId;
  return {
    ...game,
    cards: isNil(playerId)
      ? []
      : game.cards.filter((card) => card.playerId === playerId),
  };
}
