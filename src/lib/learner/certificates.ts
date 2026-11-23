import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { lessonProgress, user } from "@/lib/db/schema";
import { unitLessons } from "@/lib/curriculum";
import { checkpointKey, PASS_SCORE } from "./checkpoint";
import { DomainError } from "./repo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, any, any>;
export type Certificate = { version: 1; name: string; unit: { ar: string; en: string }; unitId: string; language: string; level: string; completedAt: string; scope: "unit-completion" };

/** Completion evidence, not a language proficiency qualification. */
export async function unitCertificate(db: Db, userId: string, unitId: string): Promise<Certificate | null> {
  const unit = await unitLessons(db, unitId);
  if (!unit) throw new DomainError("not_found");
  const evidenceIds = [...unit.lessons.map((l) => l.id), checkpointKey(unitId)];
  const rows = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, evidenceIds)));
  const passed = new Map(rows.filter((r) => r.bestScore >= PASS_SCORE).map((r) => [r.lessonId, r]));
  if (!unit.lessons.length || !unit.lessons.every((l) => passed.has(l.id)) || !passed.has(checkpointKey(unitId))) return null;
  const [owner] = await db.select({ name: user.name }).from(user).where(eq(user.id, userId));
  if (!owner) throw new DomainError("not_found");
  const completedAt = new Date(Math.max(...[...unit.lessons.map((l) => l.id), checkpointKey(unitId)].map((id) => passed.get(id)!.updatedAt.getTime()))).toISOString();
  return { version: 1, name: owner.name.slice(0, 80), unit: unit.title, unitId, language: unit.language, level: unit.level, completedAt, scope: "unit-completion" };
}

function key() {
  // Reuse the app's existing signing material, with domain separation.
  const secret = process.env.BETTER_AUTH_SECRET || process.env.DATABASE_URL;
  if (!secret) throw new Error("Certificate signing unavailable");
  return `lisan-certificate-v1:${secret}`;
}
export function signCertificate(c: Certificate) {
  const body = Buffer.from(JSON.stringify(c)).toString("base64url");
  return `${body}.${createHmac("sha256", key()).update(body).digest("base64url")}`;
}
export function verifyCertificate(token: string): Certificate | null {
  if (token.length > 6000) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expected = createHmac("sha256", key()).update(body).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const c = JSON.parse(Buffer.from(body, "base64url").toString()) as Certificate;
    if (c.version !== 1 || c.scope !== "unit-completion" || typeof c.name !== "string" || typeof c.unit?.ar !== "string" || typeof c.unit?.en !== "string" || typeof c.unitId !== "string" || typeof c.language !== "string" || typeof c.level !== "string" || !Number.isFinite(Date.parse(c.completedAt))) return null;
    return c;
  } catch { return null; }
}
