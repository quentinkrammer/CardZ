import {
  faCopyright,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GameState } from "backend";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { useCommuniationOverlayStore } from "../hooks/useCommuniationOverlayStore";
import { useIsCaptain } from "../hooks/useIsCaptain";
import { useLobbyStore } from "../hooks/useLobbyStore";
import { usePlayerName } from "../hooks/usePlayerName";
import { Button } from "./Button";

type NameProps = ComponentProps<"div"> & {
  playerId: GameState["captainsPlayerId"];
};
export function Name({ playerId, className, ...forwardProps }: NameProps) {
  const isCaptain = useIsCaptain(playerId);
  const name = usePlayerName(playerId);

  return (
    <div className={cn("flex items-center gap-2", className)} {...forwardProps}>
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
  const onToggleOverlay = useCommuniationOverlayStore((state) => state.toggle);

  if (isMe && hasComunicationLeft) {
    return (
      <Button
        className="min-w-10 rounded-full"
        label={<FontAwesomeIcon icon={faVolumeHigh} />}
        onClick={onToggleOverlay}
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

    console.log("playerId", playerId);
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
