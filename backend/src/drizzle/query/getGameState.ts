import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { pick } from "../../utils/pick.js";
import { type Db } from "../drizzle.js";
import {
  gameTable,
  SelectCard,
  SelectComunication,
  SelectDraftedQuest,
  SelectPlayer,
  SelectQuest,
} from "../schema.js";

type Turn = {
  card: SelectCard;
  communications: Array<Pick<SelectComunication, "index" | "cardId" | "type">>;
  quests: Array<Pick<SelectQuest, "questId" | "isSuccess">>;
  playerId: SelectPlayer["id"];
  playedCardNumber: number;
};
type Card = SelectCard & { playerId: SelectPlayer["id"] };
type Quest = Pick<SelectDraftedQuest, "id" | "playerId">;

export async function getGameState(db: Db, lobbyId: number) {
  // TODO: limit query to the required columns
  const game = await db.query.gameTable.findFirst({
    where: eq(gameTable.lobbyId, lobbyId),
    orderBy: [desc(gameTable.id)],
    with: {
      player: { with: { cardToPlayer: { with: { card: true } } } },
      turn: {
        with: {
          communications: true,
          draftedQuests: true,
          card: { with: { cardToPlayer: { with: { player: true } } } },
        },
      },
      draftedQuests: true,
    },
  });
  if (!game)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No game with lobby Id "${lobbyId}" found.`,
    });

  const turns = game.turn.reduce<Turn[]>((prev, curr, index) => {
    const { card, communications, draftedQuests } = curr;
    prev.push({
      playedCardNumber: index,
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

  const quests = game.draftedQuests.reduce<Quest[]>((prev, curr) => {
    prev.push({ id: curr.id, playerId: curr.playerId });
    return prev;
  }, []);

  const cards = game.player.reduce<Card[]>((prev, curr) => {
    const c = curr.cardToPlayer.map((cardToPlayer) => {
      return {
        id: cardToPlayer.cardId,
        playerId: cardToPlayer.playerId,
        color: cardToPlayer.card.color,
        value: cardToPlayer.card.color,
      };
    });
    prev.concat(c);
    return prev;
  }, []);

  return { turns, cards, quests };
}

export type GameState = ReturnType<typeof getGameState>;
