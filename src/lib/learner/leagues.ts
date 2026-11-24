import "server-only";
import {and,eq,sql} from "drizzle-orm";
import type {PgDatabase} from "drizzle-orm/pg-core";
import {leagueMembers} from "@/lib/db/schema";
import {getActiveTrack,DomainError} from "./repo";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db=PgDatabase<any,any,any>;
export function leagueWeek(now=new Date()) {
 const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
 start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);
 return {week:start.toISOString().slice(0,10),start,end:new Date(start.getTime()+7*86400000)};
}
export async function joinLeague(db:Db,userId:string,now=new Date()) {
 const track=await getActiveTrack(db,userId);if(!track)throw new DomainError("not_found");
 const {week}=leagueWeek(now);
 // A generated, non-identifying nickname. Account name and email never enter this table.
 const alias=`${crypto.randomUUID().slice(0,8).toUpperCase()}`;
 await db.insert(leagueMembers).values({userId,week,language:track.targetLanguage,alias,joinedAt:now}).onConflictDoNothing();
}
export async function leaveLeague(db:Db,userId:string,now=new Date()) {
 await db.delete(leagueMembers).where(and(eq(leagueMembers.userId,userId),eq(leagueMembers.week,leagueWeek(now).week)));
}
export async function leagueBoard(db:Db,userId:string,now=new Date()) {
 const {week,start,end}=leagueWeek(now);
 const [member]=await db.select().from(leagueMembers).where(and(eq(leagueMembers.userId,userId),eq(leagueMembers.week,week)));
 if(!member)return {week,end:end.toISOString(),member:null,rows:[]};
 // Sum across the member's tracks in the joined language. Cap each UTC day at 100.
 // Event timestamps must be after joining and not in the future. No backdating offline XP.
 const rows=await db.execute(sql`
 with daily as (
 select m.id, (a.created_at at time zone 'UTC')::date as activity_day,
 least(100, sum(greatest(0,a.xp)))::int points
 from league_members m
 join learning_tracks t on t.user_id=m.user_id and t.target_language=m.language
 join activity_events a on a.user_id=m.user_id and a.track_id=t.id
 where m.week=${week} and m.language=${member.language}
 and a.created_at>=greatest(m.joined_at,${start.toISOString()}::timestamptz)
 and a.created_at<${end.toISOString()}::timestamptz and a.created_at<=${now.toISOString()}::timestamptz
 group by m.id,activity_day
 ), totals as (
 select m.id,m.alias,coalesce(sum(d.points),0)::int points
 from league_members m left join daily d on d.id=m.id
 where m.week=${week} and m.language=${member.language} group by m.id,m.alias
 ), ranked as (select *, rank() over(order by points desc)::int rank, row_number() over(order by points desc,alias,id) position from totals)
 select alias,points,rank,(id=${member.id}::uuid) as me from ranked
 where position<=50 or id=${member.id}::uuid order by points desc,alias limit 51`);
 return {week,end:end.toISOString(),member:{alias:member.alias,language:member.language},rows:Array.from(rows) as {alias:string;points:number;rank:number;me:boolean}[]};
}
