import { afterAll, beforeEach, expect, it } from "vitest";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import * as repo from "@/lib/learner/repo";
import { startConversation, sendMessage, saveConversationWord, finishRoleplay } from "@/lib/learner/conversations";
import { signCertificate, verifyCertificate, unitCertificate } from "@/lib/learner/certificates";
import { WORK_SCENARIO_IDS } from "@/lib/ai/work-scenarios";
import { unitLessons } from "@/lib/curriculum";
const sql = postgres(process.env.DATABASE_URL!, {max:4,onnotice:()=>{}});
const db = drizzle(sql,{schema});
beforeEach(async()=>{
 process.env.AI_PROVIDER="fake";
 await sql`truncate "user" cascade`;
 for(const id of ["alice","bob"]) {
  await db.insert(schema.user).values({id,name:id,email:`${id}@test.local`});
  await repo.completeOnboarding(db,id,{nativeLanguage:"ar",targetLanguage:"en",goal:"work",dailyMinutes:15,selfLevel:"A2"},"ar");
 }
});
afterAll(async()=>{delete process.env.AI_PROVIDER;await sql.end();});
it("saves only the owner's persisted words, idempotently, into the original language",async()=>{
 const c=await startConversation(db,"alice","ar",{kind:"tutor",persona:"friendly"});
 const r=await sendMessage(db,"alice",c.id,"Hello","ar");
 await expect(saveConversationWord(db,"bob",c.id,r.assistantMessage.id,0)).rejects.toMatchObject({code:"not_found"});
 await expect(saveConversationWord(db,"alice",c.id,r.userMessage.id,0)).rejects.toMatchObject({code:"not_found"});
 await expect(saveConversationWord(db,"alice",c.id,r.assistantMessage.id,4)).rejects.toMatchObject({code:"not_found"});
 await Promise.all([0,1,2].map(()=>saveConversationWord(db,"alice",c.id,r.assistantMessage.id,0)));
 const words=await db.select().from(schema.savedWords).where(eq(schema.savedWords.userId,"alice"));
 expect(words).toHaveLength(1);expect(words[0]).toMatchObject({term:"weekend",language:"en",reps:0});
 await repo.completeOnboarding(db,"alice",{nativeLanguage:"ar",targetLanguage:"de",goal:"work",dailyMinutes:15,selfLevel:"A2"},"ar");
 await saveConversationWord(db,"alice",c.id,r.assistantMessage.id,0);
 expect(await db.select().from(schema.savedWords).where(eq(schema.savedWords.userId,"alice"))).toEqual(words);
});
it("all workplace scenarios start and concurrent finishes reward once",async()=>{
 for (const scenario of WORK_SCENARIO_IDS) {
  const c=await startConversation(db,"alice","ar",{kind:"roleplay",scenario});
  await sendMessage(db,"alice",c.id,"I have an update","ar");
  await Promise.all([finishRoleplay(db,"alice",c.id,"ar"),finishRoleplay(db,"alice",c.id,"ar")]);
 }
 const rewards=await db.select().from(schema.activityEvents).where(eq(schema.activityEvents.kind,"roleplay_report"));
 expect(rewards).toHaveLength(3);
});
it("unlocks only after all lessons and checkpoint pass, verifies signatures and rejects tampering",async()=>{
 const unit=await unitLessons(db,"en-a1-u1");expect(unit).not.toBeNull();
 expect(await unitCertificate(db,"alice","en-a1-u1")).toBeNull();
 for(const id of [...unit!.lessons.map(l=>l.id),"checkpoint:en-a1-u1"]) await db.insert(schema.lessonProgress).values({userId:"alice",lessonId:id,bestScore:70});
 const c=await unitCertificate(db,"alice","en-a1-u1");expect(c?.scope).toBe("unit-completion");
 expect(await unitCertificate(db,"bob","en-a1-u1")).toBeNull();
 const token=signCertificate(c!);expect(verifyCertificate(token)).toEqual(c);
 expect(verifyCertificate(token+"x")).toBeNull();
 const body=Buffer.from(JSON.stringify({...c,name:"Changed"})).toString("base64url");
 expect(verifyCertificate(`${body}.${token.split(".")[1]}`)).toBeNull();
 expect(verifyCertificate("invalid")).toBeNull();
 await db.update(schema.lessonProgress).set({bestScore:69}).where(eq(schema.lessonProgress.lessonId,"checkpoint:en-a1-u1"));
 expect(await unitCertificate(db,"alice","en-a1-u1")).toBeNull();
});
it("workplace starts fail cleanly when service is missing or allowance is exhausted",async()=>{
 const usageBefore=(await db.select().from(schema.aiUsage)).length;
 process.env.AI_DAILY_MESSAGES_PER_USER="0";
 try {
 await expect(startConversation(db,"alice","ar",{kind:"roleplay",scenario:"supplier_followup"})).rejects.toMatchObject({code:"daily_limit"});
 } finally {delete process.env.AI_DAILY_MESSAGES_PER_USER;}
 delete process.env.AI_PROVIDER;
 const oldAnthropic=process.env.ANTHROPIC_API_KEY,oldGemini=process.env.GEMINI_API_KEY;
 delete process.env.ANTHROPIC_API_KEY;delete process.env.GEMINI_API_KEY;
 try {
 await expect(startConversation(db,"alice","ar",{kind:"roleplay",scenario:"supplier_followup"})).rejects.toMatchObject({code:"not_configured"});
 } finally {
 if(oldAnthropic) process.env.ANTHROPIC_API_KEY=oldAnthropic;
 if(oldGemini) process.env.GEMINI_API_KEY=oldGemini;
 }
 expect(await db.select().from(schema.conversations)).toHaveLength(0);
 expect((await db.select().from(schema.aiUsage)).length).toBe(usageBefore);
});
