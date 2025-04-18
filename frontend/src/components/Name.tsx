import {
  faCopyright,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type GameState } from "backend";
import { isNil } from "lodash";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { useActivePlayer } from "../hooks/useActivePlayer";
import { useActiveTurns } from "../hooks/useActiveTurns";
import { useCommuniationOverlayStore } from "../hooks/useCommuniationOverlayStore";
import { useIsCaptain } from "../hooks/useIsCaptain";
import { useLobbyStore } from "../hooks/useLobbyStore";
import { usePlayerName } from "../hooks/usePlayerName";
import { Button } from "./Button";

type NameProps = ComponentProps<"div"> & {
  playerId: GameState["captainsPlayerId"];
};
export function Name({
  playerId,
  className,

  ...forwardProps
}: NameProps) {
  const isCaptain = useIsCaptain(playerId);
  const name = usePlayerName(playerId);
  const activePlayer = useActivePlayer();
  const isActivePlayer = activePlayer?.playerId === playerId;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded p-3 transition",
        isActivePlayer && "border backdrop-grayscale-50",
        className,
      )}
      {...forwardProps}
    >
      <div>{name}</div>
      {isCaptain && <FontAwesomeIcon icon={faCopyright} />}
      <SpeakerSymbol playerId={playerId} />
    </div>
  );
}

function SpeakerSymbol({
  playerId,
}: {
  playerId: GameState["captainsPlayerId"];
}) {
  const isMe = useIsMyPlayerId(playerId);
  const hasComunicationLeft = !useCommunication(playerId);
  const { isActive, toggle: onToggleOverlay } = useCommuniationOverlayStore(
    (state) => state,
  );
  const draftIsOngoing = useDraftIsOngoing();
  const roundIsOngoing = useActiveTurns().length > 0;

  const isDisabled = draftIsOngoing || roundIsOngoing;

  if (isMe && hasComunicationLeft) {
    return (
      <Button
        className={cn(
          "min-w-10 rounded-full",
          isActive && !isDisabled && "animate-pulse",
        )}
        label={<FontAwesomeIcon icon={faVolumeHigh} />}
        onClick={onToggleOverlay}
        disabled={isDisabled}
      />
    );
  }
  return (
    <>
      <FontAwesomeIcon
        icon={hasComunicationLeft ? faVolumeHigh : faVolumeXmark}
        color={hasComunicationLeft ? undefined : "var(--color-gray-400)"}
      />
    </>
  );
}

function useIsMyPlayerId(playerId: GameState["captainsPlayerId"]) {
  return useLobbyStore((state) => {
    const myPlayerId = state.gameState.cards[0]?.playerId;

    return playerId === myPlayerId;
  });
}

function useCommunication(playerId: GameState["captainsPlayerId"]) {
  return useLobbyStore((state) => {
    return state.gameState.communications.find(
      (communication) => communication.playerId === playerId,
    );
  });
}

function useDraftIsOngoing() {
  return useLobbyStore((state) =>
    state.gameState.quests.some((quest) => isNil(quest.playerId)),
  );
}
