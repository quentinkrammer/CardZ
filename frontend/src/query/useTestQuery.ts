import { trpc } from "../trpc.js";

export function useTestQuery() {
  return trpc.game.test.useQuery("Celine", {
    retry: false,
  });
}
