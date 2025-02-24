import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debounced;
}
