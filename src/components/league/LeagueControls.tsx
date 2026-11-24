"use client";
import {useState,useTransition} from "react";
import {leagueAction} from "@/lib/phase-next-actions";
export function LeagueControls({joined,ar}:{joined:boolean;ar:boolean}){
 const [pending,start]=useTransition(),[error,setError]=useState(false);
 return <div className="space-y-3"><button className={joined?"btn-ghost":"btn-primary"} disabled={pending} onClick={()=>{if(joined&&!window.confirm(ar?"تنسحب وتمسح اسمك وترتيبك من الأسبوع الحالي؟":"Leave and remove your nickname and ranking this week?"))return;start(async()=>{const r=await leagueAction(joined?"leave":"join");setError(!r.ok);});}}>{pending?(ar?"لحظة…":"Working…"):joined?(ar?"انسحاب ومسح اسمي من الدوري":"Leave and remove my nickname"):(ar?"موافق، انضم باسمي المستعار":"Agree and join with a nickname")}</button>{error&&<p role="alert">{ar?"لم تتم العملية. جرّب تاني.":"Could not save. Please retry."}</p>}</div>;
}
