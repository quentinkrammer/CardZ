import { Color } from "./types";

export function getValueAndColorFromQuestId(questId: string) {
  const [color, value] = questId.split("-");

  // TODO: use zod parser
  return { color: color as Color, value: Number(value) };
}
