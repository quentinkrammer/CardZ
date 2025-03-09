import { GameState } from "backend";
import { ComponentProps } from "react";
import { cn } from "../cn";
import { getQuestStatus } from "../getQuestStatus";
import { getValueAndColorFromQuestId } from "../getValueAndColorFromQuestId";
import { usePlayerQuests } from "../hooks/usePlayerQuests";
import { Quest } from "./Quest";

type QuestsProps = ComponentProps<"div"> & {
  playerId: GameState["captainsPlayerId"];
};
export function Quests({ playerId, className, ...forwardProps }: QuestsProps) {
  const quests = usePlayerQuests(playerId);

  return quests.map((quest) => {
    const { color, value } = getValueAndColorFromQuestId(quest.questId);
    const questStatus = getQuestStatus(quest.isSuccess);

    return (
      <Quest
        cardColor={color}
        value={value}
        status={questStatus}
        className={cn("z-20 scale-50 self-end justify-self-center", className)}
        key={quest.questId}
        {...forwardProps}
        style={{ viewTransitionName: `quest-${value}-${color}` }}
      />
    );
  });
}
