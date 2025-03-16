import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { range } from "lodash";
import {
  ChangeEventHandler,
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import { cn } from "../cn";
import { Button, ButtonProps } from "../components/Button";
import { Input, InputProps } from "../components/Input";
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
import { Omit } from "../types";
import { Game } from "./Game";

export function Lobby() {
  useLobbySubscription();
  const leaveLobby = trpc.lobby.leaveLobby.useMutation();
  const navigate = useNavigate();
  const lobbyId = useLobbyId();

  const { view, setView } = useGameLobbyView();

  const onLeave = () => {
    leaveLobby.mutate({ lobbyId });
    navigate("/");
  };

  if (view === "game") return <Game />;
  return (
    <div className="grid h-full w-full grid-cols-1 grid-rows-[1fr_auto_auto] gap-3 p-3">
      <div className="flex w-full flex-wrap items-center justify-center gap-3 place-self-center">
        <Users />
        <InviteUrls />
      </div>
      <QuestInput />
      <Button
        label="￩ Leave"
        onClick={onLeave}
        className="col-start-1 col-end-2 row-start-3 row-end-4 self-start justify-self-start"
      />
      <StartGameButton className="col-start-1 col-end-2 row-start-3 row-end-4 self-start justify-self-end" />
    </div>
  );
}

function QuestInput() {
  const setQuestCount = trpc.lobby.setQuestCount.useMutation();
  const questCount = useQuestToBeDraftedCount();
  const lobbyId = useLobbyId();

  const onSetQuestCount = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const newCount = Number(e.target.value);
      if (!newCount || newCount < 1 || newCount > 8) return;
      setQuestCount.mutate({ lobbyId, questCount: newCount });
    },
    [lobbyId, setQuestCount],
  );

  return (
    <div className="justify-self-center">
      <div>Number of Quests (1-8)</div>
      <Input
        type="number"
        value={questCount}
        onChange={onSetQuestCount}
        onFocus={(event) => event.target.select()}
      />
    </div>
  );
}

function InviteUrls() {
  const lobbyId = useLobbyId();

  return (
    <div className="flex max-w-140 grow-1 flex-col gap-3">
      <div>Invite others:</div>
      <CopyToClipboard value={lobbyId} />
      <CopyToClipboard value={`${env.frontendUrl}/lobby/${lobbyId}`} />
    </div>
  );
}

function CopyToClipboard({ value }: Pick<InputProps, "value">) {
  const ref = useRef<HTMLInputElement>(null);

  const onCopy = () => {
    navigator.clipboard.writeText(ref.current?.value ?? "");
  };

  return (
    <Input
      value={value}
      ref={ref}
      className="pointer-events-none"
      rightElement={
        <Button label={<FontAwesomeIcon icon={faCopy} />} onClick={onCopy} />
      }
    />
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
            <div
              className="cursor-default rounded bg-gray-900 p-2 opacity-75"
              key={index}
            >
              Empty
            </div>
          );
        }
        if (user.userId !== myData.data?.id) {
          return (
            <div className="cursor-default rounded bg-gray-900 p-2" key={index}>
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

  const onRename = (inputElement: HTMLInputElement) => {
    const value = inputElement.value;
    if (!value) return setEditMode(false);
    setName.mutate({
      name: inputElement.value,
      lobbyId: params["lobbyId"],
    });
    setEditMode(false);
  };

  return (
    <div className="cursor-pointer">
      {!editMode && (
        <div
          className="min-w-40 rounded bg-gray-900 p-2 hover:bg-gray-800"
          onClick={() => setEditMode(true)}
        >
          {isFetching ? "updating..." : name}
        </div>
      )}
      {editMode && (
        <Input
          ref={ref}
          placeholder={name}
          onBlur={(e) => onRename(e.target)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRename(e.currentTarget);
          }}
        />
      )}
    </div>
  );
}

function StartGameButton(
  props: Omit<ButtonProps, "onClick" | "label" | "disabled">,
) {
  const isReady = useGameIsReadyToBeStarted();
  const createGame = trpc.game.createGame.useMutation();
  const questCount = useQuestToBeDraftedCount();
  const lobbyId = useLobbyId();

  return (
    <Button
      {...props}
      label={"Start game"}
      onClick={() => createGame.mutate({ lobbyId, numberOfQuests: questCount })}
      disabled={!isReady}
    />
  );
}
