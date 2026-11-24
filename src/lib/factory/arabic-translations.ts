/** Separate Arabic editorial layer. Never changes source text, source credits or lesson planning. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import type { CorpusRow } from './generate';
export type ArabicTranslation = {sourceId:number;sourceHash:string;arabic:string;method:'editorial'|'opus-mt-de-ar'};
const FILE=join(process.cwd(),'data/translations/de-ar.jsonl.gz');
let cached:Map<number,ArabicTranslation>|undefined;
export function applyArabicTranslations(rows:CorpusRow[],translations:ArabicTranslation[]):CorpusRow[]{
 const index=new Map(translations.map(t=>[t.sourceId,t]));
 return rows.map(row=>{
  const hit=index.get(row.id);
  if(!hit || hit.sourceHash!==createHash('sha256').update(row.t).digest('hex').slice(0,16) || !/[\u0600-\u06ff]/u.test(hit.arabic) || /[<>▁]/u.test(hit.arabic))return row;
  return {...row,editorialAr:hit.arabic,arabicMethod:hit.method};
 });
}
export function germanArabicTranslations():ArabicTranslation[]{
 if(!cached){
  const items:ArabicTranslation[]=existsSync(FILE)?gunzipSync(readFileSync(FILE)).toString('utf8').split('\n').filter(Boolean).map(s=>JSON.parse(s)):[];
  cached=new Map(items.map(t=>[t.sourceId,t]));
 }
 return [...cached.values()];
}
