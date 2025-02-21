import { groupBy } from "lodash";
import { beforeEach, describe, test } from "vitest";
import { initiateDb } from "../initiateDb.js";
import { createGame } from "./createGame.js";
import { createLobby } from "./createLobby.js";
import { createUser } from "./createUser.js";
import { getLatestGameOfLobby } from "./getLatestGameOfLobby.js";
import { joinLobby } from "./joinLobby.js";
import { playCard } from "./playCard.js";

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

  test("lobby with 2 games", async () => {
    await createGame({ lobbyId, numberOfQuests: 1 }, { cards, quests });
    const res = await getLatestGameOfLobby(lobbyId);
    const hands = groupBy(res.cards, (card) => card.playerId);
    for (let i = 0; i < Math.floor(40 / users.length); i++) {
      Object.values(hands).forEach(async (hand) => {
        await playCard({ cardId: hand[i]!.id, gameId: res.gameId! });
      });
    }
    const res2 = await getLatestGameOfLobby(lobbyId);
    await createGame({ lobbyId, numberOfQuests: 2 }, { cards, quests });
    const res3 = await getLatestGameOfLobby(lobbyId);
    const hands2 = groupBy(res3.cards, (card) => card.playerId);
    for (let i = 0; i < Math.floor(40 / users.length) - 10; i++) {
      Object.values(hands2).forEach(async (hand) => {
        await playCard({ cardId: hand[i]!.id, gameId: res3.gameId! });
      });
    }
    const res4 = await getLatestGameOfLobby(lobbyId);
    console.log("Turn count: ", res4.turns.length);
    console.log(JSON.stringify(res4));
  });

  test("lobby without games", async () => {
    const lobbyId = await createLobby();
    users.forEach(async (user) => {
      await joinLobby({ lobbyId, userId: user.id });
    });
    const lobby = await getLatestGameOfLobby(lobbyId);

    console.log(JSON.stringify(lobby));
  });
});
