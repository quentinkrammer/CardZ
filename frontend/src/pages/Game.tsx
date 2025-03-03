import classNames from "classnames";
import { useShallow } from "zustand/react/shallow";
import { cn } from "../cn";
import { Card } from "../components/Card";
import { Quest } from "../components/Quest";
import { offsetToMiddle } from "../getShiftMultiplier";
import { useLobbyStore, useNonDraftedQuests } from "../hooks/useLobbyStore";
import { usePlayerSortedByPosition } from "../hooks/usePlayerSortedByPosition";
import { Color } from "../types";

export function Game() {
  const player = usePlayerSortedByPosition();
  // console.log({ player });

  return (
    <div className="grid h-full grid-cols-[30dvw_40dvw_30dvw] grid-rows-[33%_34%_33%] place-items-center">
      <PlayArea />
      <MyHand />
    </div>
  );
}

const borderColorToTailwindClassMap: Record<Color, string> = {
  black: "hover:border-gray-600 ",
  blue: "hover:border-sky-600",
  green: "hover:border-green-600",
  orange: "hover:border-orange-600",
  red: "hover:border-rose-600",
};

function MyHand() {
  const cards = useLobbyStore(
    useShallow((state) =>
      state.gameState.cards.toSorted((a, b) => a.id - b.id),
    ),
  );

  return (
    <div
      className={classNames(
        "relative col-start-2 row-start-3 self-end justify-self-center",
      )}
    >
      {cards.map((card, index) => {
        const offset = offsetToMiddle(cards, index);

        return (
          <Card
            cardColor={card.color}
            value={Number(card.value)}
            key={card.id}
            className={cn(
              "absolute cursor-pointer hover:z-10",
              borderColorToTailwindClassMap[card.color],
            )}
            style={{
              bottom: 0,
              translate: `calc(min(12dvh, 10dvw) * -0.5 + ${offset} * min(12dvh, 10dvw) / 1.7)`,
            }}
          />
        );
      })}
    </div>
  );
}

function PlayArea() {
  const quest = useNonDraftedQuests();

  return (
    <div className="col-start-2 row-start-2 flex h-full w-full flex-wrap items-center justify-evenly">
      {quest.map(({ questId }) => {
        const { color, value } = getValueAndColorFromQuestId(questId);
        return <Quest value={value} cardColor={color} key={questId} />;
      })}
    </div>
  );
}

function getValueAndColorFromQuestId(questId: string) {
  const [color, value] = questId.split("-");

  // TODO: use zod parser
  return { color: color as Color, value: Number(value) };
}
