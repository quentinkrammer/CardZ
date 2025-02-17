import { useEffect } from "react";
import { useNavigate } from "react-router";
import { env } from "../env";
import { useLobbySubscription } from "../hooks/useGameSubscription";
import { useLobbyId } from "../hooks/useUrlParams";
import { trpc } from "../trpc";

export function Lobby() {
  useLobbySubscription();
  // const users = useUsersStore();
  const lobbyId = useLobbyId();
  const leaveLobby = trpc.lobby.leaveLobby.useMutation();

  const navigate = useNavigate();

  useEffect(() => {
    return () => leaveLobby.mutate({ lobbyId });
  }, []);

  const onLeave = () => {
    leaveLobby.mutate({ lobbyId });
    navigate("/");
  };

  return (
    <>
      <button onClick={onLeave}>leave lobby</button>
      <div>Invite player: {`${env.url}/lobby/${lobbyId}`}</div>
      {/* <div>User: {users.map((user) => user)}</div> */}
    </>
  );
}
