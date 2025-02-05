import { beforeEach, describe, expect, test } from "vitest";
import { db } from "../drizzle/drizzle.js";
import { usersTable } from "../drizzle/schema.js";
import { appRouter } from "./appRouter.js";
import { t } from "./trpc.js";

const createCaller = t.createCallerFactory(appRouter);
const caller = createCaller({ userId: "42", db });

describe("trpc router tests", () => {
  beforeEach(async () => {});

  test("test", async () => {
    const res = await caller.game.test("Bilbo");

    expect(res.input).toBe("Bilbo");
    expect(res.context.userId).toBe("42");
  });

  test("write to db", async () => {
    const res = await db
      .insert(usersTable)
      .values({
        age: 42,
        email: "foo@bar.com",
        name: "foo",
        id: 1337,
      })
      .returning();

    console.log(JSON.stringify(res));
  });
});
