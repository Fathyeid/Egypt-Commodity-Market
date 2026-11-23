import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db=PgDatabase<any,any,any>;
import { errorLog, exerciseAttempts, learningTracks } from "@/lib/db/schema";
import { DomainError } from "./repo";
export async function dailyMistakes(db:Db,userId: string, trackId: string) {
 const [track] = await db.select().from(learningTracks).where(and(eq(learningTracks.id,trackId),eq(learningTracks.userId,userId)));
 if(!track) throw new DomainError("not_found");
 const rows=await db.select({id:errorLog.id,original:errorLog.original,corrected:errorLog.corrected,explanation:errorLog.explanation,tag:errorLog.ruleTag}).from(errorLog).where(and(eq(errorLog.userId,userId),eq(errorLog.trackId,trackId),gte(errorLog.createdAt,new Date(Date.now()-60*86400000)))).orderBy(desc(errorLog.createdAt)).limit(40);
 const done=await db.select({id:exerciseAttempts.exerciseId}).from(exerciseAttempts).where(and(eq(exerciseAttempts.userId,userId),eq(exerciseAttempts.lessonId,`daily-errors:${trackId}`),eq(exerciseAttempts.correct,true)));
 const known=new Set(done.map(r=>r.id));const seen=new Set<string>();
 return rows.filter(r=>{const k=r.original+'|'+r.corrected;if(known.has(r.id)||seen.has(k)||r.original===r.corrected)return false;seen.add(k);return true;}).slice(0,3);
}
const normalize=(s:string)=>s.normalize("NFC").trim().toLowerCase().replace(/[\p{P}\p{S}]/gu," ").replace(/\s+/g," ").trim();
export async function answerDailyMistake(db:Db,userId:string,id:string,answer:string) {
 const [row]=await db.select().from(errorLog).where(and(eq(errorLog.id,id),eq(errorLog.userId,userId)));
 if(!row) throw new DomainError("not_found");
 const [track]=await db.select().from(learningTracks).where(and(eq(learningTracks.id,row.trackId),eq(learningTracks.userId,userId),eq(learningTracks.isActive,true)));
 if(!track)throw new DomainError("not_found");
 const correct=normalize(answer)===normalize(row.corrected);
 // Practice evidence only. No bonus XP for replaying the same correction.
 await db.insert(exerciseAttempts).values({userId,lessonId:`daily-errors:${row.trackId}`,exerciseId:id,tag:row.ruleTag,correct,answer:answer.slice(0,300)});
 return {correct,expected:row.corrected,explanation:row.explanation};
}
