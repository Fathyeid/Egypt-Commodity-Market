import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {applyArabicTranslations,type ArabicTranslation} from '@/lib/factory/arabic-translations';
import {meaningOf,buildPlannedLesson,planCourses,type CorpusRow} from '@/lib/factory/generate';
import {readCorpus} from '@/lib/factory/corpus';
import {gunzipSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
const row:CorpusRow={id:1,t:'Das ist mein Haus.',en:'This is my house.',enId:2,ar:'أصل',arId:3,d:1};
const record:ArabicTranslation={sourceId:1,sourceHash:createHash('sha256').update(row.t).digest('hex').slice(0,16),arabic:'هذا بيتي.',method:'editorial'};
describe('German Arabic editorial layer',()=>{
 it('preserves source text and source credits; only Arabic display changes',()=>{
  const [translated]=applyArabicTranslations([row],[record]);
  expect(translated).toMatchObject(row);expect(meaningOf(translated,'de')).toEqual({ar:'هذا بيتي.',en:row.en});
  expect(meaningOf(row,'de').ar).toBe('أصل');
 });
 it('ignores stale or invalid translations instead of using the wrong sentence',()=>{
  expect(applyArabicTranslations([row],[{...record,sourceHash:'stale'}])[0]).toEqual(row);
  expect(applyArabicTranslations([row],[{...record,arabic:'<bad>'}])[0]).toEqual(row);
 });
 it('keeps every German lesson ID, exercise, option, answer and source attribution unchanged',()=>{
  const raw=gunzipSync(readFileSync('data/tatoeba/de.jsonl.gz')).toString('utf8').trim().split('\n').map(s=>JSON.parse(s) as CorpusRow);
  const before=planCourses('de',raw),after=planCourses('de',readCorpus('data/tatoeba/de.jsonl.gz'));
  // Strip only visible Arabic localization values. English match keys stay exact.
  const strip=(x:unknown):unknown=>Array.isArray(x)?x.map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>k!=='ar').map(([k,v])=>[k,strip(v)])):x;
  for(let c=0;c<before.length;c++){
   const a=before[c].units.flatMap(u=>u.lessons),b=after[c].units.flatMap(u=>u.lessons);
   expect(a.map(l=>l.id)).toEqual(b.map(l=>l.id));
   for(let l=0;l<a.length;l++){
    const old=buildPlannedLesson('de',before[c],a[l]),next=buildPlannedLesson('de',after[c],b[l]);
    expect(strip(next)).toEqual(strip(old));
    expect(next.content.examples.every(e=>/[\u0600-\u06ff]/u.test(e.meaning.ar))).toBe(true);
   }
  }
 },120000);
});
