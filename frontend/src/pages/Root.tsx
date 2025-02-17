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
      <div>Home</div>
      <button
        onClick={onCreate}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        create lobby
      </button>
    </>
  );
}

export default Root;
