import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../drizzle.js";
import { questTable } from "../schema.js";
import { insertQuests } from "./insertQuests.js";

describe("insertQuests", () => {
  beforeEach(async () => {
    await db.delete(questTable);
  });

  test("insertQuests", async () => {
    const res = await insertQuests();
    expect(res.length).toBe(36);
  });
});
