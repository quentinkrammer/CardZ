import { range } from "lodash";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
} from "react";
import { useNavigate, useParams } from "react-router";
import { cn } from "../cn";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { env } from "../env";
import { useGameLobbyView } from "../hooks/useGameLobbyView";
import { useLobbySubscription } from "../hooks/useGameSubscription";
import {
  useGameIsReadyToBeStarted,
  useQuestToBeDraftedCount,
  useUsersStore,
} from "../hooks/useLobbyStore";
import { useMyUserData } from "../hooks/useMyUserData";
import { useLobbyId } from "../hooks/useUrlParams";
import { trpc } from "../trpc";
import { Game } from "./Game";

export function Lobby() {
  useLobbySubscription();
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
    <div className="grid h-full w-full grid-cols-1 grid-rows-1 p-3">
      <div className="flex flex-wrap gap-3 place-self-center">
        <Users />
        <div>
          <div>Invite player: {`${env.frontendUrl}/lobby/${lobbyId}`}</div>
          <StartGameButton />
        </div>
      </div>
      <Button
        label="￩ Leave"
        onClick={onLeave}
        className="self-start justify-self-start"
      />
    </div>
  );
}

type UsersProps = ComponentProps<"div">;
function Users({ className }: UsersProps) {
  const users = useUsersStore();
  const myData = useMyUserData();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {range(4).map((index) => {
        const user = users[index];
        if (!user) {
          return (
            <div className="rounded bg-gray-900 p-2 opacity-75" key={index}>
              Empty
            </div>
          );
        }
        if (user.userId !== myData.data?.id) {
          return (
            <div className="rounded bg-gray-900 p-2" key={index}>
              {user.name}
            </div>
          );
        }
        return <MyUserName key={index} />;
      })}
    </div>
  );
}

function MyUserName() {
  const params = useParams();
  const utils = trpc.useUtils();
  const { data, isFetching } = useMyUserData();
  const [editMode, setEditMode] = useState(false);
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (!ref) return;
    if (!editMode) return;
    ref.current.focus();
  }, [editMode]);

  const name = data?.name ?? "";

  const setName = trpc.user.setName.useMutation({
    onSuccess: () => utils.user.getMyUserData.invalidate(),
  });

  return (
    <div>
      {!editMode && (
        <div
          className="min-w-40 rounded bg-gray-900 p-2"
          onDoubleClick={() => setEditMode(true)}
        >
          {isFetching ? "updating..." : name}
        </div>
      )}
      {editMode && (
        <Input
          ref={ref}
          placeholder={name}
          onBlur={(e) => {
            const value = e.target.value;
            if (!value) return setEditMode(false);
            setName.mutate({
              name: e.target.value,
              lobbyId: params["lobbyId"],
            });
            setEditMode(false);
          }}
        />
      )}
    </div>
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
