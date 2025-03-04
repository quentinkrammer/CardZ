export function offsetToMiddle(list: unknown[], index: number) {
  const length = list.length;
  const halfLengthFloor = Math.floor(length / 2);
  const offsetToMiddle = index - halfLengthFloor;
  const isOdd = length % 2 === 1;

  if (isOdd) return offsetToMiddle;

  return offsetToMiddle + 0.5;
}

export function offsets(list: unknown[]) {
  const length = list.length;
  const halfLengthFloor = Math.floor(length / 2);
  const isOdd = length % 2 === 1;

  return list.map((_, index) => {
    const offsetToMiddle = index - halfLengthFloor;

    if (isOdd) return offsetToMiddle;

    return offsetToMiddle + 0.5;
  });
}
