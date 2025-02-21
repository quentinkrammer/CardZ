import { TRPCError } from "@trpc/server";
import { isNil, isNull } from "lodash";
import { distribute } from "../../distribute.js";
import { shuffle } from "../../shuffle.js";
import { db } from "../drizzle.js";
import {
  draftedQuestTable,
  gameTable,
  SelectCard,
  SelectLobby,
  SelectQuest,
} from "../schema.js";
import { assignCards } from "./assignCards.js";
import { getLatestGameOfLobby } from "./getLatestGameOfLobby.js";
import { registerPlayer } from "./registerPlayer.js";

type GameContext = { cards: SelectCard[]; quests: SelectQuest[] };
export async function createGame(
  {
    lobbyId,
    numberOfQuests,
  }: { lobbyId: SelectLobby["id"]; numberOfQuests: number },
  context: GameContext
) {
  const gameState = await getLatestGameOfLobby(lobbyId);

  const users = gameState.users;
  const playerCount = users.length;
  if (playerCount < 3 || playerCount > 4)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot create new game. Player count must be 3-4. Current player count is "${playerCount}."`,
    });

  const lobbyHasPriorGame = !isNil(gameState.lobbyId);
  const priorGameIsOngoing = gameState.quests.some((quest) =>
    isNull(quest.isSuccess)
  );

  if (lobbyHasPriorGame && priorGameIsOngoing)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot create new game. The game with Id "${gameState.gameId}" is still ongoing inside lobby with Id ${lobbyId}.`,
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
