import { describe, test } from "vitest";

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

describe("shuffle", () => {
  test("shuffle", () => {
    const list = ["A", "B", "C", "D", "E", "F"];

    const newList1 = shuffle(list);
    const newList2 = shuffle(list);

    console.log("new 1: ", JSON.stringify(newList1));
    console.log("new 2: ", JSON.stringify(newList2));
  });
});
