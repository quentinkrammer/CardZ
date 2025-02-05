import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../env.js";

const client = createClient({ url: env.databaseUrl });
export const db = drizzle({ client });
