import { GameState } from "backend";

// TODO move to shared pnpm workspace

export function getWinningPlayer(turns: GameState["turns"]) {
  const cards = turns.map((turn) => ({
    ...turn.card,
    playerId: turn.playerId,
  }));

  if (cards.length === 0) return;

  const winningCard = cards.reduce((prev, curr) => {
    // sticht mit trumpf
    if (curr.color === "black" && prev.color !== "black") return curr;
    // farbe nicht bedient
    if (curr.color !== prev.color) return prev;
    // nummer ist niedriger
    if (curr.value < prev.value) return prev;
    return curr;
  }, cards[0]!);
  return winningCard.playerId;
}
