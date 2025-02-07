import { insertCards } from "./query/insertCards.js";
import { insertQuests } from "./query/insertQuests.js";

export async function initiateDb() {
  const cards = await insertCards();
  const quests = await insertQuests();

  return { cards, quests };
}
export type InitialDb = Awaited<ReturnType<typeof initiateDb>>;
