import { ComponentProps, ReactNode, useRef } from "react";
import { useNavigate } from "react-router";
import { cn } from "../cn";
import { trpc } from "../trpc";

export function Home() {
  const createLobby = trpc.lobby.createLobby.useMutation();
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

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
      <div className="rounded border-1 border-transparent has-[:focus-visible]:border-white">
        <input
          ref={ref}
          className="rounded bg-gray-900 p-2 shadow-[1rem_0_0_var(--color-gray-900)] hover:bg-gray-800 hover:shadow-[1rem_0_0_var(--color-gray-800)] focus:outline-0"
          placeholder="Lobby-ID"
        />
        <Button label="Join" className="rounded-l-[1rem]" />
      </div>
    </div>
  );
}

export default Home;

interface ButtonProps extends ComponentProps<"button"> {
  label: ReactNode;
}

export function Button({ label, className, ...forwardProps }: ButtonProps) {
  return (
    <button
      className={cn(
        "hover:text-shadow min-w-20 cursor-pointer rounded bg-blue-600 p-2 hover:bg-blue-500 active:bg-blue-600",
        className,
      )}
      {...forwardProps}
    >
      {label}
    </button>
  );
}
