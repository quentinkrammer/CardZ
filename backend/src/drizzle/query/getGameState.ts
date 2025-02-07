import { TRPCError } from "@trpc/server";
import { asc, desc, eq } from "drizzle-orm";
import { pick } from "../../utils/pick.js";
import { type Db } from "../drizzle.js";
import {
  gameTable,
  SelectCard,
  SelectComunication,
  SelectPlayer,
  SelectQuest,
  SelectTurn,
  turnTable,
} from "../schema.js";

type Turn = {
  card: SelectCard;
  communications: Array<Pick<SelectComunication, "index" | "cardId" | "type">>;
  quests: Array<Pick<SelectQuest, "questId" | "isSuccess">>;
  index: SelectTurn["index"];
  playerId: SelectPlayer["id"];
};

async function getGameState(db: Db, lobbyId: number) {
  const game = await db.query.gameTable.findFirst({
    where: eq(gameTable.lobbyId, lobbyId),
    orderBy: [desc(gameTable.id)],
  });
  if (!game)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No game with lobby Id "${lobbyId}" found.`,
    });

  const turns = await db.query.turnTable.findMany({
    columns: { cardId: false, gameId: false },
    with: {
      communications: true,
      draftedQuests: true,
      card: { with: { cardToPlayer: { with: { player: true } } } },
    },
    where: eq(turnTable.gameId, game.id),
    orderBy: [asc(turnTable.index)],
  });

  const turnsFlat = turns.reduce<Turn[]>((prev, curr) => {
    const { card, communications, draftedQuests, index } = curr;
    prev.push({
      index,
      // TODO throw error if playerId does not exist
      playerId: card.cardToPlayer[0]!.playerId,
      card: card,
      communications: communications.map((com) =>
        pick(com, "index", "cardId", "type")
      ),
      quests: draftedQuests.map((quest) => pick(quest, "questId", "isSuccess")),
    });
    return prev;
  }, []);

  return turnsFlat;
}
