import { GameState } from "./drizzle/query/getGameState.js";
import { subscriptionUrl } from "./subscriptionUrl.js";

export function iterateGameStateForEachUser(
  game: GameState,
  cb: (data: {
    userId: GameState["users"][number]["userId"];
    subUrl: string;
    game: GameState;
  }) => void
) {
  game.users.forEach(({ userId }) => {
    const subUrl = subscriptionUrl({
      lobbyId: game.lobbyId,
      userId,
    });
    cb({ subUrl, game, userId });
  });
}
