import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../drizzle.js";
import { cardTable } from "../schema.js";
import { insertCards } from "./insertCards.js";

describe("insertCards", () => {
  beforeEach(async () => {
    await db.delete(cardTable);
  });

  test("insertCards", async () => {
    const res = await insertCards();

    expect(res.length).toBe(40);
  });
});
