import { db } from "./drizzle.js";
import { insertCards } from "./query/insertCards.js";
import { insertQuests } from "./query/insertQuests.js";

export async function insertGamePieces() {
  const cardsOld = await db.query.cardTable.findMany();
  const cards = cardsOld.length > 0 ? cardsOld : await insertCards();

  const questsOld = await db.query.questTable.findMany();
  const quests = questsOld.length > 0 ? questsOld : await insertQuests();

  return { cards, quests };
}
export type GamePieces = Awaited<ReturnType<typeof insertGamePieces>>;
