export function shuffle<T>(list: T[]) {
  const newList = list.slice(0);
  const length = newList.length;

  for (let i = length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * length);
    const temp = newList[i]!;
    newList[i] = newList[j]!;
    newList[j] = temp;
  }

  return newList;
}
