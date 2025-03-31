import { flushSync } from "react-dom";
import { trpc } from "../trpc";
import { setLocalStorage } from "../utils/localSorage";
import { useLobbyStore, type Lobby } from "./useLobbyStore";
import { useUrlParams } from "./useUrlParams";

const startViewTransition = document.startViewTransition;

export function useLobbySubscription() {
  const { lobbyId } = useUrlParams();
  const updateLobby = useLobbyStore((state) => state.update);

  const result = trpc.lobby.joinLobby.useSubscription(
    { lobbyId },
    {
      onStarted: () => {
        setLocalStorage("lobbyId", lobbyId);
      },
      onData: (d) => {
        if (!startViewTransition) {
          updateLobby(d as Lobby);
          return;
        }
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
