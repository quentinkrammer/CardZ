import { useNavigate } from "react-router";
import { trpc } from "../trpc";

export function Root() {
  const createLobby = trpc.lobby.createLobby.useMutation();
  const navigate = useNavigate();

  const onCreate = async () => {
    const { lobbyId } = await createLobby.mutateAsync();
    navigate(`/lobby/${lobbyId}`);
  };

  return (
    <>
      Home
      <button onClick={onCreate}>create lobby</button>
    </>
  );
}

export default Root;
