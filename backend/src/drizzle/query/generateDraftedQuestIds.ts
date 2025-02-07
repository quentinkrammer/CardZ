import { random } from "lodash";
import { type InitialDb } from "../initiateDb.js";

export async function generateDraftedQuestIds({
  amount,
  initialQuests,
}: {
  amount: number;
  initialQuests: InitialDb["quests"];
}) {
  const draftedQuests = new Set<string>();
  while (draftedQuests.size < amount) {
    const randomQuestId =
      initialQuests[random(0, initialQuests.length - 1)]?.id;
    if (!randomQuestId)
      throw new Error("Failed to draft a quest. Quest ID was undefined.");
    draftedQuests.add(randomQuestId);
  }
  return Array.from(draftedQuests);
}
