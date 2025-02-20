import { useNavigate } from "react-router";
import { env } from "../env";
import { useLobbySubscription } from "../hooks/useGameSubscription";
import { useUsersStore } from "../hooks/useLobbyStore";
import { useLobbyId } from "../hooks/useUrlParams";
import { trpc } from "../trpc";

export function Lobby() {
  useLobbySubscription();
  const users = useUsersStore();
  const lobbyId = useLobbyId();
  const leaveLobby = trpc.lobby.leaveLobby.useMutation();

  const navigate = useNavigate();

  const onLeave = () => {
    leaveLobby.mutate({ lobbyId });
    navigate("/");
  };

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
    </>
  );
}
