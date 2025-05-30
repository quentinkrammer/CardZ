import { TRPCError } from "@trpc/server";
import { asc, desc, eq } from "drizzle-orm";
import chunk from "lodash/chunk.js";
import isNil from "lodash/isNil.js";
import isNull from "lodash/isNull.js";
import {
  Card,
  CardCount,
  GameState,
  Player,
  Quest,
  Turn,
  User,
} from "../../types.js";
import { getActivePlayer } from "../../utils/getActivePlayer.js";
import { getWinningPlayer } from "../../utils/getWinningPlayer.js";
import { pick } from "../../utils/pick.js";
import { db } from "../drizzle.js";
import {
  gameTable,
  lobbyTable,
  playerTable,
  SelectCard,
  SelectLobby,
  SelectPlayer,
  turnTable,
} from "../schema.js";

export async function getLatestGameOfLobby(
  lobbyId: SelectLobby["id"]
): Promise<GameState> {
  async function getGameState() {
    const lobby = await db.query.lobbyTable.findFirst({
      where: eq(lobbyTable.id, lobbyId),
      with: {
        games: {
          orderBy: [desc(gameTable.id)],
          limit: 1,
          with: {
            player: {
              orderBy: [asc(playerTable.number)],
              with: {
                cardToPlayer: {
                  with: { card: true, player: { with: { user: true } } },
                },
              },
            },
            turn: {
              orderBy: [asc(turnTable.id)],
              with: {
                draftedQuests: true,
                card: true,
              },
            },
            draftedQuests: true,
            communications: true,
          },
        },
        lobbyToUser: { columns: { userId: true }, with: { user: true } },
      },
    });

    if (!lobby)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No lobby with Id "${lobbyId}" found.`,
      });

    const game = lobby?.games[0];

    const cardToPlayerFlat =
      game?.player.flatMap((player) =>
        player.cardToPlayer.map((cardToPlayer) => ({
          cardId: cardToPlayer.cardId,
          playerId: cardToPlayer.playerId,
        }))
      ) ?? [];

    const mapCardIdToPlayerId = cardToPlayerFlat.reduce<
      Record<SelectCard["id"], SelectPlayer["id"]>
    >((prev, curr) => {
      prev[curr.cardId] = curr.playerId;

      return prev;
    }, {});

    const turns =
      game?.turn.reduce<Turn[]>((prev, curr) => {
        const { card, draftedQuests, id } = curr;
        prev.push({
          playerId: mapCardIdToPlayerId[card.id]!,
          card: pick(card, "id", "color", "value"),
          quests: draftedQuests.map((quest) =>
            pick(quest, "questId", "isSuccess")
          ),
          turnId: id,
        });
        return prev;
      }, []) ?? [];

    const cards =
      game?.player.reduce<Card[]>((prev, curr) => {
        const cardsOfPlayer = curr.cardToPlayer.map((cardToPlayer) => {
          return {
            id: cardToPlayer.cardId,
            playerId: cardToPlayer.playerId,
            color: cardToPlayer.card.color,
            value: cardToPlayer.card.value,
          };
        });
        prev.push(...cardsOfPlayer);
        return prev;
      }, []) ?? [];

    const nonPlayedCards = turns.reduce(
      (prev, curr) => prev.filter((card) => card.id !== curr.card.id),
      cards
    );

    const cardCount = nonPlayedCards.reduce<CardCount>((prev, curr) => {
      const playerId = curr.playerId;
      if (isNil(prev[playerId])) {
        prev[playerId] = 1;
        return prev;
      }
      prev[playerId]++;
      return prev;
    }, {});

    const players =
      game?.player
        .reduce<Player[]>((prev, curr) => {
          const player = curr.cardToPlayer[0]!.player;
          prev.push({
            userId: player.userId,
            playerId: player.id,
            number: player.number,
          });
          return prev;
        }, [])
        .toSorted((player) => player.number) ?? [];

    const users = lobby.lobbyToUser.reduce<User[]>((prev, curr) => {
      const user = curr.user;
      prev.push({ userId: user.id, name: user.name });

      return prev;
    }, []);

    const captainsPlayerId =
      cards.find((card) => card.color === "black" && card.value === "4")
        ?.playerId ?? NaN;

    const communications =
      game?.communications.map((communication) => {
        const card = cards.find((card) => card.id === communication.cardId);

        if (isNil(card))
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "CardId of Communication can't be found.",
          });

        return {
          ...pick(communication, "cardId", "type"),
          playerId: card.playerId,
          cardColor: card.color,
          cardValue: card.value,
        };
      }) ?? [];

    const questsWihtoutSuccessStatus =
      game?.draftedQuests.reduce<Quest[]>((prev, curr) => {
        prev.push({
          draftedQuestId: curr.id,
          questId: curr.questId,
          playerId: curr.playerId,
          isSuccess: curr.isSuccess,
        });
        return prev;
      }, []) ?? [];

    const quests = chunk(turns, players.length).reduce(
      (prev, curr) => {
        if (curr.length < players.length) return prev;

        const questWithSuccessStatus = prev.map((quest) => {
          if (!isNull(quest.isSuccess) || isNull(quest.playerId)) return quest;

          const status = getQuestSuccess(curr, quest.questId, quest.playerId);

          return { ...quest, isSuccess: status };
        });

        return questWithSuccessStatus;
      },
      [...questsWihtoutSuccessStatus]
    );

    function getQuestSuccess(turns: Turn[], questId: string, playerId: number) {
      const [color, value] = questId.split("-");

      const turnWithQuest = turns.find(
        ({ card }) => card.color === color && card.value === value
      );
      if (!turnWithQuest) return null;

      const winningPlayerId = getWinningPlayer(turns);
      if (isNil(winningPlayerId)) return null;

      return playerId === winningPlayerId;
    }

    return {
      turns,
      cards: nonPlayedCards,
      quests,
      gameId: game?.id,
      lobbyId,
      users,
      players,
      questToBeDraftedCount: lobby.questCount,
      communications,
      cardCount,
      captainsPlayerId,
    };
  }

  const gameState = await getGameState();
  const activePlayer = getActivePlayer(gameState);
  return {
    ...gameState,
    players: gameState.players.map((player) =>
      player.playerId === activePlayer?.playerId
        ? { ...player, isActivePlayer: true }
        : player
    ),
  };
}
