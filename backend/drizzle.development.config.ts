import { config } from "dotenv";
import { type Config } from "drizzle-kit";
import { z } from "zod";

const env = config({ path: ".env.development" });

export default {
  schema: "./src/drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: z.string().parse(env.parsed?.["VITE_DATABASE_URL"]),
  },
} satisfies Config;
