import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { pick } from "../../utils/pick.js";
import { db } from "../drizzle.js";
import {
  gameTable,
  lobbyTable,
  SelectCard,
  SelectComunication,
  SelectDraftedQuest,
  SelectGame,
  SelectLobby,
  SelectPlayer,
  SelectUser,
} from "../schema.js";

type Turn = {
  card: SelectCard;
  communications: Array<Pick<SelectComunication, "index" | "cardId" | "type">>;
  quests: Array<Pick<SelectDraftedQuest, "questId" | "isSuccess">>;
  playerId: SelectPlayer["id"];
  playedCardNumber: number;
};
type Card = SelectCard & { playerId: SelectPlayer["id"] };
type Quest = Pick<SelectDraftedQuest, "id" | "playerId">;
type User = Pick<SelectUser, "name"> & { userId: SelectUser["id"] };

export type GameState = {
  users: User[];
  quests: Quest[];
  cards: Card[];
  turns: Turn[];
  lobbyId: SelectLobby["id"];
  gameId?: SelectGame["id"];
};

export async function getGameState(
  lobbyId: SelectLobby["id"]
): Promise<GameState> {
  // TODO: limit query to the required columns
  const game = await db.query.gameTable.findFirst({
    where: eq(gameTable.lobbyId, lobbyId),
    orderBy: [desc(gameTable.id)],
    with: {
      player: {
        with: {
          cardToPlayer: {
            with: { card: true, player: { with: { user: true } } },
          },
        },
      },
      turn: {
        with: {
          communications: true,
          draftedQuests: true,
          card: { with: { cardToPlayer: true } },
        },
      },
      draftedQuests: true,
    },
  });
  if (!game) {
    const lobby = await db.query.lobbyTable.findFirst({
      where: eq(lobbyTable.id, lobbyId),
      with: { lobbyToUser: { with: { user: true } } },
    });

    if (!lobby)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No game with lobby Id "${lobbyId}" found.`,
      });

    return {
      lobbyId,
      users: lobby.lobbyToUser.map<User>((lobbyToUser) => ({
        userId: lobbyToUser.userId,
        name: lobbyToUser.user.name,
      })),
      turns: [],
      cards: [],
      quests: [],
    };
  }

  const turns = game.turn.reduce<Turn[]>((prev, curr, index) => {
    const { card, communications, draftedQuests } = curr;
    prev.push({
      playedCardNumber: index,
      // TODO throw error if playerId does not exist
      playerId: card.cardToPlayer[0]!.playerId,
      card: pick(card, "id", "color", "value"),
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
    const cardsOfPlayer = curr.cardToPlayer.map((cardToPlayer) => {
      return {
        id: cardToPlayer.cardId,
        playerId: cardToPlayer.playerId,
        color: cardToPlayer.card.color,
        value: cardToPlayer.card.value,
      };
    });
    prev.push(...cardsOfPlayer);
    return prev;
  }, []);

  const users = game.player.reduce<User[]>((prev, curr) => {
    const user = curr.cardToPlayer[0]!.player.user;
    prev.push({ userId: user.id, name: user.name });
    return prev;
  }, []);

  return { turns, cards, quests, gameId: game.id, lobbyId, users };
}
