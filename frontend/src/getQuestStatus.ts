export function getQuestStatus(isSuccess: boolean | null) {
  if (isSuccess === true) return "success";
  if (isSuccess === false) return "failed";
}
