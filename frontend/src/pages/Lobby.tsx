import { useCallback, type ChangeEventHandler } from "react";
import { useNavigate } from "react-router";
import { env } from "../env";
import { useGameLobbyView } from "../hooks/useGameLobbyView";
import { useLobbySubscription } from "../hooks/useGameSubscription";
import {
  useGameIsReadyToBeStarted,
  useQuestToBeDraftedCount,
  useUsersStore,
} from "../hooks/useLobbyStore";
import { useLobbyId } from "../hooks/useUrlParams";
import { trpc } from "../trpc";
import { Game } from "./Game";

export function Lobby() {
  useLobbySubscription();
  const users = useUsersStore();
  const lobbyId = useLobbyId();
  const leaveLobby = trpc.lobby.leaveLobby.useMutation();
  const navigate = useNavigate();
  const { view, setView } = useGameLobbyView();

  const onLeave = () => {
    leaveLobby.mutate({ lobbyId });
    navigate("/");
  };

  if (view === "game") return <Game />;
  return (
    <>
      <button
        onClick={onLeave}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        leave lobby
      </button>
      <div>Invite player: {`${env.url}/lobby/${lobbyId}`}</div>
      <div>User: {users.map((user) => user)}</div>
      <StartGameButton />
    </>
  );
}

function StartGameButton() {
  const isReady = useGameIsReadyToBeStarted();
  const createGame = trpc.game.createGame.useMutation();
  const setQuestCount = trpc.lobby.setQuestCount.useMutation();
  const questCount = useQuestToBeDraftedCount();
  const lobbyId = useLobbyId();

  const onSetQuestCount = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const newCount = Number(e.target.value);
      if (!newCount) return;
      setQuestCount.mutate({ lobbyId, questCount: newCount });
    },
    [lobbyId, setQuestCount],
  );

  return (
    <>
      <button
        onClick={() =>
          createGame.mutate({ lobbyId, numberOfQuests: questCount })
        }
        disabled={!isReady}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Start Game
      </button>
      <input type="number" value={questCount} onChange={onSetQuestCount} />
    </>
  );
}
