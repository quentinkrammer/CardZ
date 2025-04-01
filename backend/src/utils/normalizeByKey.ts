export function normalizeByKey<
  TObj extends Record<string, unknown>,
  UKey extends keyof TObj,
>(data: TObj[], key: UKey) {
  return data.reduce<Record<string | number, TObj>>((prev, curr) => {
    const newKey = curr[key];
    if (typeof newKey !== "string" && typeof newKey !== "number") return prev;
    prev[newKey] = curr;
    return prev;
  }, {});
}
