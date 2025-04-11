import { useEffect, useState } from "react";
import { z } from "zod";

type Schema = {
  [index: string]: z.ZodTypeAny;
};

function createLocalStorage<T extends Schema, U extends keyof T>(schema: T) {
  const getLocalStorage = (key: U) => {
    const value = localStorage.getItem(key as string);
    return schema[key]?.or(z.null()).parse(value);
  };

  const setLocalStorage = (key: U, value: z.infer<T[U]>) => {
    localStorage.setItem(key as string, value);
  };

  const useGetLocalStorage = (key: U) => {
    const [item, setItem] = useState<undefined | z.infer<T[U]>>(undefined);

    useEffect(() => {
      const item = getLocalStorage(key);
      setItem(item);
    }, [key]);

    return item;
  };

  const useSetLocalStorage = (key: U, value: z.infer<T[U]>) => {
    useEffect(() => {
      setLocalStorage(key, value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, JSON.stringify(value)]);
  };

  return {
    getLocalStorage,
    setLocalStorage,
    useGetLocalStorage,
    useSetLocalStorage,
  };
}

const schema = { lobbyId: z.string() };

export const {
  getLocalStorage,
  setLocalStorage,
  useGetLocalStorage,
  useSetLocalStorage,
} = createLocalStorage(schema);
