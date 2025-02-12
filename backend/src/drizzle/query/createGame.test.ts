import { beforeEach, describe, test } from "vitest";
import { initiateDb } from "../initiateDb.js";
import { createGame } from "./createGame.js";
import { createLobby } from "./createLobby.js";
import { createUser } from "./createUser.js";
import { getGameState } from "./getGameState.js";
import { joinLobby } from "./joinLobby.js";

const { cards, quests } = await initiateDb();
const lobbyId = await createLobby();
const users = [
  { id: "user1", name: "John1" },
  { id: "user2", name: "John2" },
  { id: "user3", name: "John3" },
];
await createUser(...users);
await joinLobby(...users.map((user) => ({ userId: user.id, lobbyId })));

describe("createGame", () => {
  beforeEach(async () => {});

  test("test", async () => {
    await createGame({ lobbyId, numberOfQuests: 1 }, { cards, quests });
    const res = await getGameState(lobbyId);

    console.log(JSON.stringify(res));
  });
});
