import { z } from "zod";

const untyped = {
  mode: import.meta.env.MODE,
  backendUrl: import.meta.env["VITE_BACKEND_URL"],
};

export const env = z
  .object({ mode: z.string(), backendUrl: z.string() })
  .parse(untyped);
