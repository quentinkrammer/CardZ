import { Quest } from "../components/Quest";
import { useNonDraftedQuests } from "../hooks/useLobbyStore";
import { Color } from "../types";

export function Game() {
  return (
    <div className="grid h-full grid-cols-[30%_40%_30%] grid-rows-[33%_34%_33%] place-items-center">
      <PlayArea />
    </div>
  );
}

function PlayArea() {
  const quest = useNonDraftedQuests();

  return (
    <div className="col-start-2 row-start-2 flex h-full w-full flex-wrap items-center justify-evenly">
      {quest.map(({ questId }) => {
        const { color, value } = getValueAndColorFromQuestId(questId);
        return (
          <Quest
            value={value}
            cardColor={color}
            key={questId}
            className="grow-1"
          />
        );
      })}
    </div>
  );
}

function getValueAndColorFromQuestId(questId: string) {
  const [color, value] = questId.split("-");

  // TODO: use zod parser
  return { color: color as Color, value: Number(value) };
}
