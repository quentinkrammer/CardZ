import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../../env.js";
import { insertGamePieces } from "./insertGamePieces.js";
import * as schema from "./schema.js";

const client = createClient({ url: env.databaseUrl });
export const db = drizzle({ client, schema });
export type Db = typeof db;

export const gamePieces = await insertGamePieces();

if (env.mode === "test") {
  await db.run(sql`PRAGMA busy_timeout = 10000;`);
}
