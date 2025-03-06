import { faCopyright } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GameState } from "backend";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { useIsCaptain } from "../hooks/useIsCaptain";
import { usePlayerName } from "../hooks/usePlayerName";

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
    </div>
  );
}
