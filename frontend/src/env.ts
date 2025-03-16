import { z } from "zod";

const untyped = {
  mode: import.meta.env.MODE,
  backendUrl: import.meta.env["VITE_BACKEND_URL"],
  frontendUrl: import.meta.env["VITE_FRONTEND_URL"],
};

export const env = z
  .object({ mode: z.string(), backendUrl: z.string(), frontendUrl: z.string() })
  .parse(untyped);
