import { z } from "zod";

const untyped = {
  authCookieSecret: import.meta.env["VITE_AUTH_COOKIE_SECRET"],
  databaseUrl: import.meta.env["VITE_DATABASE_URL"],
  frontendUrl: JSON.parse(import.meta.env["VITE_FRONTEND_URL"]),
  salt: import.meta.env["VITE_SALT"],
  port: import.meta.env["VITE_PORT"],
  mode: import.meta.env.MODE,
};

export const env = z
  .object({
    databaseUrl: z.string(),
    frontendUrl: z.array(z.string()),
    mode: z.string(),
    salt: z.string().transform((value) => Number(value)),
    port: z.string().transform((value) => Number(value)),
    authCookieSecret: z.string(),
  })
  .parse(untyped);
