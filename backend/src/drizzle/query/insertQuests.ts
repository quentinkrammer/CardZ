import { range } from "lodash";
import { db } from "../drizzle.js";
import { InsertCard, questTable } from "../schema.js";

const colors: InsertCard["color"][] = ["red", "orange", "green", "blue"];

export function insertQuests() {
  const baseQuests = colors.flatMap((color) =>
    range(35).map((index) => ({ id: `${color}-${index + 1}` }))
  );

  db.insert(questTable).values(baseQuests);
}
