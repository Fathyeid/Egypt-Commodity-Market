import {NextResponse} from "next/server";
import {z} from "zod";
import {getSession} from "@/lib/auth/session";
import {db} from "@/lib/db";
import {syncOffline} from "@/lib/offline/server";
import {DomainError} from "@/lib/learner/repo";
const answers=z.record(z.string().max(100),z.union([z.number().int().min(0).max(20),z.string().max(300),z.array(z.string().max(200)).max(12)])).refine(x=>Object.keys(x).length<=50);
const input=z.object({attemptId:z.uuid(),token:z.string().max(4000),answers,practiceAnswers:answers.optional(),durationSeconds:z.number().min(0).max(3600),lang:z.enum(["ar","en"])});
export async function POST(req:Request){
 if(req.headers.get("origin")!==new URL(req.url).origin)return NextResponse.json({error:"origin"},{status:403});
 const session=await getSession();if(!session)return NextResponse.json({error:"unauthorized"},{status:401});
 try{const text=await req.text();if(text.length>30000)return NextResponse.json({error:"invalid"},{status:400});const data=input.safeParse(JSON.parse(text));if(!data.success)return NextResponse.json({error:"invalid"},{status:400});return NextResponse.json({owner:session.user.id,result:await syncOffline(db,session.user.id,data.data)},{headers:{"Cache-Control":"no-store"}});}catch(e){return NextResponse.json({error:e instanceof DomainError?e.code:"retry"},{status:409});}
}
