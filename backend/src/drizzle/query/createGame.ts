import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { distribute } from "../../distribute.js";
import { shuffle } from "../../shuffle.js";
import { db } from "../drizzle.js";
import {
  draftedQuestTable,
  gameTable,
  lobbyTable,
  SelectCard,
  SelectLobby,
  SelectQuest,
} from "../schema.js";
import { assignCards } from "./assignCards.js";
import { registerPlayer } from "./registerPlayer.js";

type GameContext = { cards: SelectCard[]; quests: SelectQuest[] };
export async function createGame(
  {
    lobbyId,
    numberOfQuests,
  }: { lobbyId: SelectLobby["id"]; numberOfQuests: number },
  context: GameContext
) {
  const lobby = await db.query.lobbyTable.findFirst({
    where: eq(lobbyTable.id, lobbyId),
    with: {
      lobbyToUser: { columns: { userId: true } },
      games: {
        orderBy: [desc(gameTable.id)],
        limit: 1,
        with: { turn: true, player: { columns: { id: true } } },
      },
    },
  });

  if (!lobby)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot create new game for this lobby. No lobby with Id "${lobbyId}" found.`,
    });

  const users = lobby.lobbyToUser;
  const playerCount = users.length;
  if (playerCount < 3 || playerCount > 4)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot create new game. Player count must be 3-4. Current player count is "${playerCount}."`,
    });

  const hasPriorGame = lobby.games.length > 0;
  const priorGame = lobby.games[1];
  const priorGamePlayerCount = priorGame?.player.length || NaN;
  const priorGameIsOngoing =
    priorGame?.turn.length !== Math.floor(40 / priorGamePlayerCount);
  if (hasPriorGame && priorGameIsOngoing)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot create new game. The game with Id "${lobby.games[0]?.id}" is still ongoing inside lobby with Id ${lobbyId}.`,
    });

  const shuffeledCards = distribute(shuffle(context.cards), playerCount);
  const draftedQuests = shuffle(context.quests).slice(0, numberOfQuests);

  const gameId = (
    await db.insert(gameTable).values({ lobbyId }).returning()
  )[0]!.id;

  const players = users.map(({ userId }, number) => ({
    gameId,
    number,
    userId,
  }));
  const registeredPlayers = await registerPlayer(...players);

  const cards = registeredPlayers.flatMap((player, index) => {
    return shuffeledCards[index]!.map((card) => ({
      cardId: card.id,
      playerId: player.id,
    }));
  });
  await assignCards(...cards);

  await db
    .insert(draftedQuestTable)
    .values(draftedQuests.map((quest) => ({ gameId, questId: quest.id })));
}
