import { type GameState } from "backend";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import { trpc } from "../trpc";
import { setLocalStorage } from "../utils/localSorage";
import { useLobbyStore } from "./useLobbyStore";
import { useUrlParams } from "./useUrlParams";

const startViewTransition = document.startViewTransition;

export function useLobbySubscription() {
  const { lobbyId } = useUrlParams();
  const updateLobby = useLobbyStore((state) => state.update);
  const navigate = useNavigate();

  const result = trpc.lobby.joinLobby.useSubscription(
    { lobbyId },
    {
      onStarted: () => {},
      onData: (d) => {
        setLocalStorage("lobbyId", lobbyId);

        if (!startViewTransition) {
          updateLobby(d as GameState);
          return;
        }
        document.startViewTransition(() => {
          flushSync(() => {
            updateLobby(d as GameState);
          });
        });
        console.log("SSE data:", d);
      },
      onError: (e) => {
        console.log("error: ", e);
        navigate("/");
      },
    },
  );

  return result;
}
