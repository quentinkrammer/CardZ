import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { range } from "lodash";
import { ChangeEventHandler, ComponentProps, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { cn } from "../cn";
import { Button, ButtonProps } from "../components/Button";
import { Input, InputProps } from "../components/Input";
import { MyUserName } from "../components/MyUserName";
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
      <CopyToClipboard defaultValue={lobbyId} />
      <CopyToClipboard defaultValue={`${env.frontendUrl}/lobby/${lobbyId}`} />
    </div>
  );
}

function CopyToClipboard({ defaultValue }: Pick<InputProps, "defaultValue">) {
  const ref = useRef<HTMLInputElement>(null);

  const onCopy = () => {
    navigator.clipboard.writeText(ref.current?.value ?? "");
  };

  return (
    <Input
      defaultValue={defaultValue}
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
  const { data, isLoading } = useMyUserData();
  if (isLoading) return "...loading";
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
        if (user.userId !== data?.id) {
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
