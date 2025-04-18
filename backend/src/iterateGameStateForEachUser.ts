import { SelectUser } from "./drizzle/schema.js";
import { secrifyGameState } from "./secrifyGameState.js";
import { subscriptionUrl } from "./subscriptionUrl.js";
import { type GameState } from "./types.js";

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
