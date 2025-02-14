import { env as nodeEnv } from "node:process";
import { z } from "zod";

const untyped = {
  // @ts-expect-error env variable missing
  databaseUrl: import.meta.env.VITE_DATABASE_URL,
  // @ts-expect-error env variable missing
  frontendUrl: JSON.parse(import.meta.env.VITE_FRONTEND_URL),
  // @ts-expect-error env variable missing
  salt: import.meta.env.VITE_SALT,
  // @ts-expect-error env variable missing
  port: import.meta.env.VITE_PORT,
  mode: import.meta.env.MODE,
  sessionCookieSecret: import.meta.env.PROD
    ? nodeEnv["SECRET"]
    : // @ts-expect-error env variable missing
      import.meta.env.VITE_SESSION_COOKIE_SECRET,
};

export const env = z
  .object({
    databaseUrl: z.string(),
    frontendUrl: z.array(z.string()),
    mode: z.string(),
    salt: z.string().transform((value) => Number(value)),
    port: z.string().transform((value) => Number(value)),
    sessionCookieSecret: z.string(),
  })
  .parse(untyped);
