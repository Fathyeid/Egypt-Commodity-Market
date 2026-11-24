"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {getSession} from "@/lib/auth/session";
import {db} from "@/lib/db";
import {joinLeague,leaveLeague} from "@/lib/learner/leagues";
import {startLevelExam,submitLevelExam} from "@/lib/learner/level-completion";
async function uid(){return (await getSession())?.user.id;}
export async function leagueAction(action:unknown){const id=await uid();if(!id)return {ok:false};if(action!=="join"&&action!=="leave")return {ok:false};try{if(action==="join")await joinLeague(db,id);else await leaveLeague(db,id);revalidatePath("/[lang]/learn/league","page");return {ok:true};}catch{return {ok:false};}}
export async function startLevelAction(courseId:unknown){const id=await uid();if(!id||typeof courseId!=="string"||courseId.length>120)return {ok:false as const};try{return {ok:true as const,result:await startLevelExam(db,id,courseId)};}catch{return {ok:false as const};}}
export async function submitLevelAction(token:unknown,answers:unknown){const id=await uid();const parsed=z.record(z.string().max(10),z.union([z.string().max(1000),z.number().int().min(0).max(50),z.array(z.string().max(500)).max(30)])).safeParse(answers);if(!id||typeof token!=="string"||token.length>12000||!parsed.success||Object.keys(parsed.data).length>80)return {ok:false as const};try{const result=await submitLevelExam(db,id,token,parsed.data);revalidatePath("/[lang]/learn/level/[courseId]","page");return {ok:true as const,result};}catch{return {ok:false as const};}}
