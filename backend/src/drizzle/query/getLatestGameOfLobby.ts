import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { isNil } from "lodash";
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
  SelectQuest,
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
type Quest = Pick<SelectDraftedQuest, "playerId" | "isSuccess"> & {
  questId: SelectQuest["id"];
  draftedQuestId: SelectDraftedQuest["id"];
};
type User = Pick<SelectUser, "name"> & { userId: SelectUser["id"] };
type Player = Pick<SelectPlayer, "number" | "userId"> & {
  playerId: SelectPlayer["id"];
};
type CardCount = Record<SelectPlayer["id"], number>;
export type GameState = {
  questToBeDraftedCount: number;
  players: Player[];
  users: User[];
  quests: Quest[];
  turns: Turn[];
  cards: Card[];
  cardCount: CardCount;
  lobbyId: SelectLobby["id"];
  gameId?: SelectGame["id"] | undefined;
};

export async function getLatestGameOfLobby(
  lobbyId: SelectLobby["id"]
): Promise<GameState> {
  const lobby = await db.query.lobbyTable.findFirst({
    where: eq(lobbyTable.id, lobbyId),
    with: {
      games: {
        orderBy: [desc(gameTable.id)],
        limit: 1,
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
      },
      lobbyToUser: { columns: { userId: true }, with: { user: true } },
    },
  });

  if (!lobby)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No lobby with Id "${lobbyId}" found.`,
    });

  const game = lobby?.games[0];

  const turns =
    game?.turn.reduce<Turn[]>((prev, curr, index) => {
      const { card, communications, draftedQuests } = curr;
      prev.push({
        playedCardNumber: index,
        // TODO throw error if playerId does not exist
        playerId: card.cardToPlayer[0]!.playerId,
        card: pick(card, "id", "color", "value"),
        communications: communications.map((com) =>
          pick(com, "index", "cardId", "type")
        ),
        quests: draftedQuests.map((quest) =>
          pick(quest, "questId", "isSuccess")
        ),
      });
      return prev;
    }, []) ?? [];

  const quests =
    game?.draftedQuests.reduce<Quest[]>((prev, curr) => {
      prev.push({
        draftedQuestId: curr.id,
        questId: curr.questId,
        playerId: curr.playerId,
        isSuccess: curr.isSuccess,
      });
      return prev;
    }, []) ?? [];

  const cards =
    game?.player.reduce<Card[]>((prev, curr) => {
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
    }, []) ?? [];

  const cardCount = cards.reduce<CardCount>((prev, curr) => {
    const playerId = curr.playerId;
    if (isNil(prev[playerId])) {
      prev[playerId] = 1;
      return prev;
    }
    prev[playerId]++;
    return prev;
  }, {});

  const players =
    game?.player.reduce<Player[]>((prev, curr) => {
      const player = curr.cardToPlayer[0]!.player;
      prev.push({
        userId: player.userId,
        playerId: player.id,
        number: player.number,
      });
      return prev;
    }, []) ?? [];

  const users = lobby.lobbyToUser.reduce<User[]>((prev, curr) => {
    const user = curr.user;
    prev.push({ userId: user.id, name: user.name });

    return prev;
  }, []);

  return {
    turns,
    cards,
    quests,
    gameId: game?.id,
    lobbyId,
    users,
    players,
    questToBeDraftedCount: lobby.questCount,
    cardCount,
  };
}
