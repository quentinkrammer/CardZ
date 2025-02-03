import { z } from "zod";

const untyped = {
  mode: import.meta.env.MODE,
  url: import.meta.env["VITE_BACKEND_URL"],
  wsUrl: import.meta.env["VITE_WEBSOCKET_URL"],
};

export const env = z
  .object({ mode: z.string(), url: z.string(), wsUrl: z.string() })
  .parse(untyped);
