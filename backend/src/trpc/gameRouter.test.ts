import { beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "./appRouter.js";
import { t } from "./trpc.js";

const createCaller = t.createCallerFactory(appRouter);
const caller = createCaller({ userId: "42" });

describe("trpc router tests", () => {
  beforeEach(async () => {});

  test("test", async () => {
    const res = await caller.game.test("Bilbo");

    expect(res.input).toBe("Bilbo");
    expect(res.context.userId).toBe("42");
  });
});
