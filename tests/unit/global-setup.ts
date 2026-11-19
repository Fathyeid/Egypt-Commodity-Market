import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { languages } from "../../src/lib/db/schema";
import { LAUNCH_LANGUAGES } from "../../src/lib/db/languages";

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://lisan:lisan@localhost:5432/lisan_test";
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  await sql`drop schema if exists public cascade`;
  await sql`drop schema if exists drizzle cascade`;
  await sql`create schema public`;
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "drizzle" });
  await db.insert(languages).values(LAUNCH_LANGUAGES.map((l, i) => ({ ...l, sortOrder: i })));
  await sql.end();
}
