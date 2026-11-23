import {beforeEach,afterAll,it,expect} from "vitest";
import postgres from "postgres";
import {drizzle} from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import {completeOnboarding,getActiveTrack,addTrack} from "@/lib/learner/repo";
import {dailyMistakes,answerDailyMistake} from "@/lib/learner/daily";
const sql=postgres(process.env.DATABASE_URL!,{max:2,onnotice:()=>{}});const db=drizzle(sql,{schema});
beforeEach(async()=>{await sql`truncate "user" cascade`;for(const id of ["a","b"]){await db.insert(schema.user).values({id,name:id,email:`${id}@test.dev`});await completeOnboarding(db,id,{nativeLanguage:"ar",targetLanguage:"en",goal:"work",dailyMinutes:15,selfLevel:"A1"},"ar");}});afterAll(()=>sql.end());
async function mistake(){const track=(await getActiveTrack(db,"a"))!;const [row]=await db.insert(schema.errorLog).values({userId:"a",trackId:track.id,source:"tutor",category:"grammar",ruleTag:"be",original:"He are here",corrected:"He is here",explanation:"is with he"}).returning();return row;}
it("scopes corrections and answers to the owner",async()=>{const m=await mistake();expect(await dailyMistakes(db,"a",m.trackId)).toHaveLength(1);await expect(dailyMistakes(db,"b",m.trackId)).rejects.toThrow("not_found");await expect(answerDailyMistake(db,"b",m.id,"He is here")).rejects.toThrow("not_found");});
it("keeps a failed correction due, removes a repaired one, and awards no XP",async()=>{const m=await mistake();expect((await answerDailyMistake(db,"a",m.id,"He are here")).correct).toBe(false);expect(await dailyMistakes(db,"a",m.trackId)).toHaveLength(1);expect((await answerDailyMistake(db,"a",m.id,"He is here.")).correct).toBe(true);expect(await dailyMistakes(db,"a",m.trackId)).toHaveLength(0);expect(await db.select().from(schema.activityEvents)).toHaveLength(0);});
it("does not submit an old track correction into a newly active language",async()=>{const m=await mistake();await addTrack(db,"a",{targetLanguage:"de",goal:"work",dailyMinutes:15,selfLevel:"A1"});await expect(answerDailyMistake(db,"a",m.id,"He is here")).rejects.toThrow("not_found");});
