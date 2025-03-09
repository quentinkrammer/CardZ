export function pick<U extends object, V extends keyof U>(
  obj: U,
  ...keys: V[]
): Pick<U, V> {
  const newObj = {} as Pick<U, V>;
  keys.forEach((key) => (newObj[key] = obj[key]));

  return newObj;
}
