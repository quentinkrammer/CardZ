import { config } from "dotenv";
import { type Config } from "drizzle-kit";

const env = config({ path: ".env.test" });

export default {
  schema: "./src/drizzle/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.parsed?.["VITE_DATABASE_URL"] as string,
  },
} satisfies Config;
