import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

// Reuse one pool across hot reloads in development.
const g = globalThis as unknown as { __lisanSql?: ReturnType<typeof postgres> };
// Poolers in transaction mode (e.g. Neon "-pooler" hosts) need prepared statements off.
const sql = g.__lisanSql ?? postgres(url, { max: 10, prepare: !/-pooler\./.test(url) });
if (process.env.NODE_ENV !== "production") g.__lisanSql = sql;

export const db = drizzle(sql, { schema });
export type DB = typeof db;
