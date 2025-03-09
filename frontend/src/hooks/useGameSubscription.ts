import { flushSync } from "react-dom";
import { trpc } from "../trpc";
import { useLobbyStore, type Lobby } from "./useLobbyStore";
import { useUrlParams } from "./useUrlParams";

export function useLobbySubscription() {
  const { lobbyId } = useUrlParams();
  const updateLobby = useLobbyStore((state) => state.update);
  const result = trpc.lobby.joinLobby.useSubscription(
    { lobbyId },
    {
      onStarted: () => {
        console.log("started");
      },
      onData: (d) => {
        document.startViewTransition(() => {
          flushSync(() => {
            updateLobby(d as Lobby);
          });
        });
        console.log("SSE data:", d);
      },
      onError: (e) => {
        console.log("error: ", e);
      },
    },
  );

  return result;
}
