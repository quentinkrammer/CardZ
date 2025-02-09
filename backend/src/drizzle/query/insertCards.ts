import { range } from "lodash";
import { db } from "../drizzle.js";
import { cardTable, InsertCard } from "../schema.js";

const colors: InsertCard["color"][] = ["red", "orange", "green", "blue"];

export async function insertCards() {
  const baseCards = colors.flatMap((color) =>
    range(9).map((number) => ({ color, value: `${number}` }))
  );

  const trumpCards = range(3).map((number) => ({
    color: "black" as const,
    value: `${number}`,
  }));

  const cards = await db
    .insert(cardTable)
    .values([...baseCards, ...trumpCards])
    .returning();

  return cards;
}
