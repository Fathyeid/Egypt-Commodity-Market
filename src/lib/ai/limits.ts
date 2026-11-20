import { and, eq, gte, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { aiUsage } from "@/lib/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;

/** Owner-controlled cost guards (env). Defaults are conservative until plans exist (Phase 6). */
export const limits = () => ({
  dailyMessagesPerUser: Number(process.env.AI_DAILY_MESSAGES_PER_USER ?? 40),
  monthlyBudgetMicros: Math.round(Number(process.env.AI_MONTHLY_BUDGET_USD ?? 20) * 1_000_000),
});

export async function checkLimits(db: Db, userId: string, now = new Date()): Promise<"ok" | "daily_limit" | "budget_exhausted"> {
  const l = limits();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [month] = await db
    .select({ micros: sql<number>`coalesce(sum(${aiUsage.costMicros}), 0)::bigint` })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, monthStart));
  if (Number(month.micros) >= l.monthlyBudgetMicros) return "budget_exhausted";
  const [today] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), gte(aiUsage.createdAt, dayStart)));
  if (today.n >= l.dailyMessagesPerUser) return "daily_limit";
  return "ok";
}
