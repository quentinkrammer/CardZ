import { isNil } from "lodash";
import { GameState } from "./drizzle/query/getLatestGameOfLobby.js";
import { SelectUser } from "./drizzle/schema.js";

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
