import "server-only";
import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {and,eq,inArray,sql} from "drizzle-orm";
import type {PgDatabase} from "drizzle-orm/pg-core";
import {activityEvents,learningReceipts,lessonProgress,user} from "@/lib/db/schema";
import {coursesForLanguage,getLesson,outlineLessonIds,type CourseOutline} from "@/lib/curriculum";
import {gradeExercise,toPublicExercise,type ExerciseAnswer} from "@/content";
import type {Exercise} from "@/content/types";
import {getActiveTrack,DomainError} from "./repo";
import {checkpointKey,PASS_SCORE} from "./checkpoint";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db=PgDatabase<any,any,any>;
export type LevelCertificate={version:1;scope:"level-completion";name:string;courseId:string;title:{ar:string;en:string};language:string;level:string;completedAt:string;score:number;lessons:number;units:number;revision:string};
function key(){const secret=process.env.BETTER_AUTH_SECRET||process.env.DATABASE_URL;if(!secret)throw new Error("Signing unavailable");return `lisan-level-v1:${secret}`;}
function sign(body:object){const text=Buffer.from(JSON.stringify(body)).toString("base64url");return `${text}.${createHmac("sha256",key()).update(text).digest("base64url")}`;}
function verify<T>(token:string):T|null{if(typeof token!=="string"||token.length>12000)return null;const [body,sig,...extra]=token.split(".");if(!body||!sig||extra.length)return null;const expected=createHmac("sha256",key()).update(body).digest(),actual=Buffer.from(sig,"base64url");if(actual.length!==expected.length||!timingSafeEqual(expected,actual))return null;try{return JSON.parse(Buffer.from(body,"base64url").toString()) as T;}catch{return null;}}
export const signLevelCertificate=(c:LevelCertificate)=>sign(c);
export function verifyLevelCertificate(token:string){const c=verify<LevelCertificate>(token);return c?.scope==="level-completion"&&c.version===1&&typeof c.name==="string"&&typeof c.title?.ar==="string"&&typeof c.title?.en==="string"&&Number.isFinite(Date.parse(c.completedAt))&&c.score>=70?c:null;}
export function levelEvidenceIds(c:CourseOutline){return [...outlineLessonIds(c),...c.units.map(u=>checkpointKey(u.id))];}
async function courseFor(db:Db,userId:string,courseId:string){const track=await getActiveTrack(db,userId);if(!track)throw new DomainError("not_found");const course=(await coursesForLanguage(db,track.targetLanguage)).find(c=>c.id===courseId);if(!course)throw new DomainError("not_found");return {course,track};}
async function evidence(db:Db,userId:string,c:CourseOutline){const ids=levelEvidenceIds(c);const rows=ids.length?await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId,userId),inArray(lessonProgress.lessonId,ids))):[];const passed=new Set(rows.filter(r=>r.bestScore>=PASS_SCORE).map(r=>r.lessonId));return {passed,eligible:ids.length>0&&ids.every(id=>passed.has(id))};}
// At least one question from each unit, then spread further questions over its lessons.
// Courses with more than 24 units get at least one per unit, up to a bounded 80 units.
export function examLessonIds(c:CourseOutline){if(c.units.length>80)throw new DomainError("invalid");const target=Math.max(24,c.units.length),ids:string[]=[];for(let round=0;ids.length<target;round++){let added=false;for(const unit of c.units){const lesson=unit.lessons[round];if(lesson&&ids.length<target){ids.push(lesson.id);added=true;}}if(!added)break;}return ids;}
async function examContent(db:Db,c:CourseOutline){const selected=examLessonIds(c),questions:Exercise[]=[];const loaded=await Promise.all(selected.map(id=>getLesson(db,id)));for(const [i,l] of loaded.entries()){const q=l?.lesson.quiz[i%l.lesson.quiz.length];if(q)questions.push({...q,id:`f${i}`} as Exercise);}if(!questions.length)throw new DomainError("not_found");const revision=createHash("sha256").update(JSON.stringify({ids:levelEvidenceIds(c),questions})).digest("hex");return {questions,revision};}
export async function levelOverview(db:Db,userId:string,courseId:string){const {course}=await courseFor(db,userId,courseId),{passed,eligible}=await evidence(db,userId,course);return {course,eligible,done:outlineLessonIds(course).filter(id=>passed.has(id)).length,units:course.units.map(u=>({id:u.id,title:u.title,total:u.lessons.length,done:u.lessons.filter(l=>passed.has(l.id)).length,checkpoint:passed.has(checkpointKey(u.id)),nextId:u.lessons.find(l=>!passed.has(l.id))?.id??null}))};}
export async function startLevelExam(db:Db,userId:string,courseId:string,now=new Date()){
 const {course}=await courseFor(db,userId,courseId);if(!(await evidence(db,userId,course)).eligible)throw new DomainError("invalid");const {questions,revision}=await examContent(db,course);
 const token=sign({scope:"exam",userId,courseId,revision,expires:now.getTime()+2*3600000,attemptId:crypto.randomUUID()});
 return {token,questions:questions.map(q=>toPublicExercise(q,courseId)),language:course.language};
}
type ExamToken={scope:string;userId:string;courseId:string;revision:string;expires:number;attemptId:string};
export async function submitLevelExam(db:Db,userId:string,token:string,answers:Record<string,ExerciseAnswer>,now=new Date()){
 const t=verify<ExamToken>(token);if(!t||t.scope!=="exam"||t.userId!==userId||!Number.isFinite(t.expires)||t.expires<now.getTime())throw new DomainError("invalid");
 const {course,track}=await courseFor(db,userId,t.courseId);if(!(await evidence(db,userId,course)).eligible)throw new DomainError("invalid");
 const {questions,revision}=await examContent(db,course);if(revision!==t.revision)throw new DomainError("invalid");
 return db.transaction(async tx=>{await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}),hashtext(${`level:${course.id}`}))`);
 const [old]=await tx.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.attemptId,t.attemptId)));if(old){if(old.kind!=="level-exam"||old.resourceId!==course.id)throw new DomainError("invalid");return old.result as LevelOutcome;}
 const results=questions.map(q=>({id:q.id,...gradeExercise(q,answers[q.id]??"",course.language)})),correct=results.filter(r=>r.correct).length,score=Math.round(correct/questions.length*100);
 const prior=await tx.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.kind,"level-exam"),eq(learningReceipts.resourceId,course.id)));
 const xp=score>=70&&!prior.some(r=>(r.result as LevelOutcome).xp>0)?50:0;
 const result:LevelOutcome={score,correct,total:questions.length,passed:score>=70,xp,results,revision,completedAt:now.toISOString()};
 await tx.insert(learningReceipts).values({userId,attemptId:t.attemptId,kind:"level-exam",resourceId:course.id,result});if(xp)await tx.insert(activityEvents).values({userId,trackId:track.id,kind:"level-exam",durationSeconds:0,xp});return result;});
}
export type LevelOutcome={score:number;correct:number;total:number;passed:boolean;xp:number;results:{id:string;correct:boolean;expected:string}[];revision:string;completedAt:string};
export async function levelCertificate(db:Db,userId:string,courseId:string):Promise<LevelCertificate|null>{
 const {course}=await courseFor(db,userId,courseId);if(!(await evidence(db,userId,course)).eligible)return null;const {revision}=await examContent(db,course);
 const rows=await db.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.kind,"level-exam"),eq(learningReceipts.resourceId,courseId)));
 const result=rows.map(r=>r.result as LevelOutcome).filter(r=>r.passed&&r.revision===revision).sort((a,b)=>b.score-a.score)[0];if(!result)return null;
 const [owner]=await db.select({name:user.name}).from(user).where(eq(user.id,userId));if(!owner)return null;
 return {version:1,scope:"level-completion",name:owner.name.slice(0,80),courseId,title:course.title,language:course.language,level:course.level,score:result.score,completedAt:result.completedAt,lessons:outlineLessonIds(course).length,units:course.units.length,revision};
}
