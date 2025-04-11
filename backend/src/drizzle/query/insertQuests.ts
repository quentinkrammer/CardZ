import range from "lodash/range.js";
import { db } from "../drizzle.js";
import { InsertCard, questTable } from "../schema.js";

const colors: InsertCard["color"][] = ["red", "orange", "green", "blue"];

export async function insertQuests() {
  const baseQuests = colors.flatMap((color) =>
    range(9).map((index) => ({ id: `${color}-${index + 1}` }))
  );

  const quests = await db.insert(questTable).values(baseQuests).returning();
  return quests;
}
