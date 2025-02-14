import { trpc } from "../trpc";
import { useUrlParams } from "./useUrlParams";

export function useLobbySubscription() {
  const { lobbyId } = useUrlParams();
  const result = trpc.lobby.joinLobby.useSubscription(
    { lobbyId },
    {
      onData: (d) => {
        console.log("SSE data:", d);
      },
    },
  );

  return result;
}
