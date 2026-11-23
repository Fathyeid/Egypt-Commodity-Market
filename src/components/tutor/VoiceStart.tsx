"use client";
import { useState,useTransition } from "react";
import { startVoiceSessionAction } from "@/lib/actions";
export function VoiceStart({lang,scenario,disabled,errors}:{lang:"ar"|"en";scenario:string;disabled:boolean;errors:Record<string,string>}){const [pending,start]=useTransition();const [error,setError]=useState<string|null>(null);return <><button className="btn-primary mt-4" disabled={disabled||pending} onClick={()=>start(async()=>{const r=await startVoiceSessionAction(lang,scenario);if(r&&!r.ok)setError(errors[r.error]??errors.generic);})}>{pending?(lang==="ar"?"بنجهز الحصة…":"Preparing session…"):(lang==="ar"?"ابدأ الحصة":"Start session")}</button>{error&&<p role="alert" className="mt-2 text-sm text-danger">{error}</p>}</>;}
