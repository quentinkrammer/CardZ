export function distribute<T>(list: T[], distributeBy: number) {
  const newList: T[][] = [];
  list.forEach((listItem, index) => {
    const chunkIndex = index % distributeBy;
    let chunk = newList?.[chunkIndex];

    if (!Array.isArray(chunk)) {
      newList[chunkIndex] = [];
    }

    newList[chunkIndex]?.push(listItem);
  });

  return newList;
}
