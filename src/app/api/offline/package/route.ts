import {NextResponse} from "next/server";
import {getSession} from "@/lib/auth/session";
import {db} from "@/lib/db";
import {offlinePackage} from "@/lib/offline/server";
export async function GET(req:Request){const session=await getSession();if(!session)return NextResponse.json({error:"unauthorized"},{status:401});const id=new URL(req.url).searchParams.get("lessonId");if(!id||id.length>180)return NextResponse.json({error:"invalid"},{status:400});try{return NextResponse.json(await offlinePackage(db,session.user.id,id),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"not_found"},{status:404});}}
