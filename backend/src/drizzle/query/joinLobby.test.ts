import { nanoid } from "nanoid";
import { describe, expect, test } from "vitest";
import { insertGamePieces } from "../initiateDb.js";
import { createLobby } from "./createLobby.js";
import { createUser } from "./createUser.js";
import { joinLobby } from "./joinLobby.js";

const {} = await insertGamePieces();
const lobbyId = await createLobby();
const userId = await createUser({ id: nanoid() });

describe("insertQuests", () => {
  test("insertQuests", async () => {
    const res = await joinLobby({ lobbyId, userId });
    expect(res[0]?.lobbyId).toBe(lobbyId);
    expect(res[0]?.userId).toBe(userId);
  });
});
