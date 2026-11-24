import "server-only";
import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import {eq,and,sql} from "drizzle-orm";
import type {PgDatabase} from "drizzle-orm/pg-core";
import {learningReceipts} from "@/lib/db/schema";
import {resolveLesson,submitQuiz,checkExercise} from "@/lib/learner/study";
import {DomainError} from "@/lib/learner/repo";
import {toPublicLesson,type ExerciseAnswer} from "@/content";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db=PgDatabase<any,any,any>;
const key=()=>`lisan-offline-v1:${process.env.BETTER_AUTH_SECRET||process.env.DATABASE_URL}`;
const fingerprint=(x:unknown)=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
function sign(value:unknown){const body=Buffer.from(JSON.stringify(value)).toString("base64url");return `${body}.${createHmac("sha256",key()).update(body).digest("base64url")}`;}
function verify(token:string){try{if(token.length>4000)return null;const [body,sig]=token.split(".");const a=createHmac("sha256",key()).update(body).digest(),b=Buffer.from(sig,"base64url");if(a.length!==b.length||!timingSafeEqual(a,b))return null;return JSON.parse(Buffer.from(body,"base64url").toString());}catch{return null;}}
export async function offlinePackage(db:Db,userId:string,lessonId:string){
 const f=await resolveLesson(db,userId,lessonId);
 return {owner:userId,trackId:f.track.id,language:f.language,lesson:toPublicLesson(f.lesson),attribution:f.attribution,savedAt:new Date().toISOString(),token:sign({v:1,userId,trackId:f.track.id,lessonId,hash:fingerprint(f.lesson),expires:Date.now()+30*86400000})};
}
export async function syncOffline(db:Db,userId:string,input:{attemptId:string;token:string;answers:Record<string,ExerciseAnswer>;practiceAnswers?:Record<string,ExerciseAnswer>;durationSeconds:number;lang:"ar"|"en"}){
 const token=verify(input.token);if(!token||token.v!==1||token.userId!==userId)throw new DomainError("not_found");
 return db.transaction(async tx=>{
 await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}), hashtext(${input.attemptId}))`);
 const [old]=await tx.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.attemptId,input.attemptId)));
 if(old){if(old.resourceId!==token.lessonId||old.kind!=="offline")throw new DomainError("not_found");return old.result;}
 if(token.expires<Date.now())throw new DomainError("package_expired");
 const f=await resolveLesson(tx,userId,token.lessonId);
 if(f.track.id!==token.trackId)throw new DomainError("track_changed");
 if(fingerprint(f.lesson)!==token.hash)throw new DomainError("content_changed");
 if(!f.lesson.quiz.length||f.lesson.quiz.some(q=>!Object.hasOwn(input.answers,q.id)))throw new DomainError("invalid");
 const practiceResults=[];
 for(const [id,answer]of Object.entries(input.practiceAnswers??{})){practiceResults.push({id,...await checkExercise(tx,userId,token.lessonId,id,answer)});}
 const quizResult=await submitQuiz(tx,userId,token.lessonId,input.answers,input.durationSeconds,input.lang);
 const result={...quizResult,practiceResults};
 await tx.insert(learningReceipts).values({userId,attemptId:input.attemptId,kind:"offline",resourceId:token.lessonId,result});return result;
 });
}
