import { isNil } from "lodash";
import { GameState } from "./drizzle/query/getLatestGameOfLobby.js";
import { SelectUser } from "./drizzle/schema.js";
import { subscriptionUrl } from "./subscriptionUrl.js";

export function iterateGameStateForEachUser(
  game: GameState,
  cb: (data: {
    userId: SelectUser["id"];
    subUrl: string;
    game: GameState;
    secrefiedGame: GameState;
  }) => void
) {
  game.users.forEach(({ userId }) => {
    const subUrl = subscriptionUrl({
      lobbyId: game.lobbyId,
      userId,
    });
    const secrefiedGame = secrifyGameState({ game, userId });

    cb({ subUrl, game, userId, secrefiedGame });
  });
}

function secrifyGameState({
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
