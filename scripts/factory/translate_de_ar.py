"""Offline, resumable German to Arabic translation. Never calls a paid service.
Local OPUS-MT model, Apache 2.0. Outputs drafts; promotion is separate.
"""
import argparse,gzip,json,time,re,os,hashlib
from pathlib import Path
import ctranslate2,sentencepiece as sp
p=argparse.ArgumentParser();p.add_argument('--seconds',type=int,default=90);p.add_argument('--model-dir',required=True);p.add_argument('--output',required=True);a=p.parse_args()
root=str(Path(__file__).resolve().parents[2]);out=a.output
rows=[json.loads(l) for l in gzip.open(root+'/data/tatoeba/de.jsonl.gz','rt')]
done={json.loads(l)['sourceId'] for l in open(out)} if os.path.exists(out) else set()
s=sp.SentencePieceProcessor(model_file=a.model_dir+'/source.spm');t=sp.SentencePieceProcessor(model_file=a.model_dir+'/target.spm')
m=ctranslate2.Translator(a.model_dir,compute_type='int8',intra_threads=2,inter_threads=1)
queue=[r for r in rows if not r.get('ar') and r['id'] not in done]
start=time.time();count=0
with open(out,'a') as f:
 for i in range(0,len(queue),32):
  batch=queue[i:i+32]
  rs=m.translate_batch([['>>ara<<']+s.encode(r['t'],out_type=str) for r in batch],beam_size=4,max_decoding_length=160,repetition_penalty=1.1,no_repeat_ngram_size=4)
  for r,result in zip(batch,rs):
   text=t.decode(result.hypotheses[0]).strip()
   flags=[]
   if not re.search('[\u0600-\u06ff]',text):flags.append('no-arabic')
   if re.search(r'[<>▁]|[A-Za-z]{3}',text):flags.append('token-leak')
   if len(result.hypotheses[0])>=159:flags.append('truncated')
   if len(text)>len(r['t'])*4+40:flags.append('too-long')
   if len(text)<max(2,len(r['t'])*.12):flags.append('too-short')
   if text.count('(')!=text.count(')'):flags.append('unbalanced-parentheses')
   f.write(json.dumps({'sourceId':r['id'],'sourceHash':hashlib.sha256(r['t'].encode()).hexdigest()[:16],'arabic':text,'method':'opus-mt-de-ar','flags':flags},ensure_ascii=False)+'\n')
  f.flush();count+=len(batch)
  if time.time()-start>=a.seconds:break
print(json.dumps({'new':count,'total':len(done)+count,'missing':len(queue)-count,'seconds':round(time.time()-start,1)}))
