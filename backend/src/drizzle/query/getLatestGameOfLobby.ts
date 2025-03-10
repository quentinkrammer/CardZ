import { TRPCError } from "@trpc/server";
import { asc, desc, eq } from "drizzle-orm";
import { isNil } from "lodash";
import { pick } from "../../utils/pick.js";
import { db } from "../drizzle.js";
import {
  gameTable,
  lobbyTable,
  playerTable,
  SelectCard,
  SelectComunication,
  SelectDraftedQuest,
  SelectGame,
  SelectLobby,
  SelectPlayer,
  SelectQuest,
  SelectTurn,
  SelectUser,
  turnTable,
} from "../schema.js";

type Communication = Pick<SelectComunication, "cardId" | "turnId" | "type">;
type Turn = {
  card: SelectCard;
  quests: Array<Pick<SelectDraftedQuest, "questId" | "isSuccess">>;
  playerId: SelectPlayer["id"];
  turnId: SelectTurn["id"];
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
  captainsPlayerId: number;
  questToBeDraftedCount: number;
  players: Player[];
  users: User[];
  quests: Quest[];
  turns: Turn[];
  cards: Card[];
  communications: Communication[];
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
            orderBy: [asc(playerTable.number)],
            with: {
              cardToPlayer: {
                with: { card: true, player: { with: { user: true } } },
              },
            },
          },
          turn: {
            orderBy: [asc(turnTable.id)],
            with: {
              draftedQuests: true,
              card: true,
            },
          },
          draftedQuests: true,
          communications: true,
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

  const cardToPlayerFlat =
    game?.player.flatMap((player) =>
      player.cardToPlayer.map((cardToPlayer) => ({
        cardId: cardToPlayer.cardId,
        playerId: cardToPlayer.playerId,
      }))
    ) ?? [];

  const mapCardIdToPlayerId = cardToPlayerFlat.reduce<
    Record<SelectCard["id"], SelectPlayer["id"]>
  >((prev, curr) => {
    prev[curr.cardId] = curr.playerId;

    return prev;
  }, {});

  const turns =
    game?.turn.reduce<Turn[]>((prev, curr) => {
      const { card, draftedQuests, id } = curr;
      prev.push({
        playerId: mapCardIdToPlayerId[card.id]!,
        card: pick(card, "id", "color", "value"),
        quests: draftedQuests.map((quest) =>
          pick(quest, "questId", "isSuccess")
        ),
        turnId: id,
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

  const nonPlayedCards = turns.reduce(
    (prev, curr) => prev.filter((card) => card.id !== curr.card.id),
    cards
  );

  const cardCount = nonPlayedCards.reduce<CardCount>((prev, curr) => {
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

  const captainsPlayerId =
    cards.find((card) => card.color === "black" && card.value === "4")
      ?.playerId ?? NaN;

  const communications =
    game?.communications.map((communication) =>
      pick(communication, "cardId", "type", "turnId")
    ) ?? [];

  return {
    turns,
    cards: nonPlayedCards,
    quests,
    gameId: game?.id,
    lobbyId,
    users,
    players,
    questToBeDraftedCount: lobby.questCount,
    communications,
    cardCount,
    captainsPlayerId,
  };
}
