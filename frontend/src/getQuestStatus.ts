export function getQuestStatus(isSuccess: boolean | null) {
  switch (isSuccess) {
    case isSuccess === true:
      return "success";
    case isSuccess === false:
      return "failed";
    default:
      return undefined;
  }
}
