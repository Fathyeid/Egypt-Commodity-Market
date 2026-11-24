import "server-only";
import {and,eq,sql} from "drizzle-orm";
import type {PgDatabase} from "drizzle-orm/pg-core";
import {learningReceipts,activityEvents} from "@/lib/db/schema";
import {getActiveTrack,DomainError} from "@/lib/learner/repo";
import {storyById} from "./catalog";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db=PgDatabase<any,any,any>;
export async function completeStory(db:Db,userId:string,id:string,path:string[],answers:Record<string,number>,attemptId:string){
 const story=storyById(id);const track=await getActiveTrack(db,userId);if(!story||track?.targetLanguage!==story.language)throw new DomainError("not_found");
 if(path[0]!==story.nodes[0].id||path.length>story.nodes.length)throw new DomainError("invalid");
 for(let i=0;i<path.length;i++){const node=story.nodes.find(n=>n.id===path[i]);if(!node||i<path.length-1&&!node.choices.some(c=>c.next===path[i+1])||i===path.length-1&&node.choices.length)throw new DomainError("invalid");}
 return db.transaction(async tx=>{await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}),hashtext(${`story:${id}`}))`);
 const [old]=await tx.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.attemptId,attemptId)));if(old){if(old.kind!=="story"||old.resourceId!==id)throw new DomainError("invalid");return old.result;}
 const previous=await tx.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.kind,"story"),eq(learningReceipts.resourceId,id)));
 const results=story.questions.map(q=>({id:q.id,correct:answers[q.id]===q.answer,expected:q.options[q.answer],explain:q.explain}));const correct=results.filter(x=>x.correct).length,score=Math.round(correct/results.length*100);
 const awarded=previous.some(x=>(x.result as {xp:number}).xp>0);const xp=score>=70&&!awarded?15:0;const result={score,correct,total:results.length,xp,results};
 await tx.insert(learningReceipts).values({userId,attemptId,kind:"story",resourceId:id,result});if(xp)await tx.insert(activityEvents).values({userId,trackId:track.id,kind:"story",durationSeconds:0,xp});return result;});
}
export async function storyScores(db:Db,userId:string){const rows=await db.select().from(learningReceipts).where(and(eq(learningReceipts.userId,userId),eq(learningReceipts.kind,"story")));return Object.fromEntries([...new Set(rows.map(r=>r.resourceId))].map(id=>[id,Math.max(...rows.filter(r=>r.resourceId===id).map(r=>(r.result as {score:number}).score))]));}
