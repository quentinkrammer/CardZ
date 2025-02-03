import { trpc } from "./trpc";

export function useGameSubscription() {
  const result = trpc.game.onEvent.useSubscription(undefined, {
    onData: (d) => {
      console.log("SSE data:", d);
    },
  });

  return result;
}
