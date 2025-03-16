import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { trpc } from "../trpc";
import { getLocalStorage } from "../utils/localSorage";

export function Home() {
  const createLobby = trpc.lobby.createLobby.useMutation();
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const inputElement = ref.current;
    if (!inputElement) return;
    const lobbyId = getLocalStorage("lobbyId");
    inputElement.value = lobbyId ?? "";
  }, []);

  const onCreate = async () => {
    const { lobbyId } = await createLobby.mutateAsync();
    navigate(`/lobby/${lobbyId}`);
  };

  const onJoin = () => {
    const lobbyId = ref.current?.value;
    if (lobbyId) navigate(`/lobby/${lobbyId}`);
  };

  return (
    <div className="grid h-full place-content-center gap-2">
      <Button label="Create" onClick={onCreate} />
      <Input
        placeholder="Lobby-ID"
        ref={ref}
        className=""
        rightElement={
          <Button label="Join" className="rounded-l-[1rem]" onClick={onJoin} />
        }
      />
    </div>
  );
}

export default Home;
