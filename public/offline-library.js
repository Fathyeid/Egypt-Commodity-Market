/* Offline public study reader. All curriculum text is inserted as text, never HTML. */
(() => {
  const CACHE = "lisan-public-lessons-v1";
  let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "ar";
  try { if(localStorage.getItem("lisan-theme")==="dark")document.documentElement.dataset.theme="dark"; } catch {}
  const $ = (id) => document.getElementById(id);
  const text = (ar, en) => lang === "ar" ? ar : en;
  const local = (value) => typeof value === "string" ? value : value?.[lang] ?? "";
  const add = (parent, tag, value) => { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; };
  const PRIVATE = "lisan-private-offline-v1";
  async function render() {
    document.documentElement.lang = lang;
    document.title = text("لسان · مكتبتي بدون نت", "Lisan · My offline library");
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("lang").textContent = text("English", "العربية");
    $("title").textContent = text("مكتبتي من غير نت", "My offline library");
    $("note").textContent = text("ذاكر وحل من غير نت. الإجابات تتصحح على الخادم وقت المزامنة، والنقاط تُحسب يومها مرة واحدة لكل محاولة. النسخ والإجابات محفوظة للحساب في هذا المتصفح فقط وتُمسح عند الخروج. الفيديو غير متاح والصوت حسب الجهاز.", "Study and answer offline. Server grading happens on sync; XP counts on that day once per attempt. Packages and answers stay in this browser for the account and are cleared on sign-out. Video is online only; speech depends on the device.");
    $("reload").textContent = text("إعادة المحاولة أونلاين", "Try online again");
    $("clear").textContent = text("مسح الدروس المحفوظة", "Clear saved lessons");
    $("list").replaceChildren(); $("reader").hidden = true;
    try {
      const cache = await caches.open(CACHE);
      const keys = await cache.keys();
      $("status").textContent = keys.length ? text(`${keys.length} درس محفوظ على الجهاز`, `${keys.length} lessons saved on this device`) : text("دروس حسابك ومحاولاتك تظهر تحت. لتنزيل المزيد افتح الدرس وأنت أونلاين.", "Your account lessons and attempts appear below. Open lessons online to download more.");
      await privateLessons();
      for (const key of keys.reverse()) {
        const response = await cache.match(key); if (!response) continue;
        const data = await response.json();
        const article = add($("list"), "article", "");
        add(article, "h2", local(data.lesson.title));
        add(article, "small", `${data.language.toUpperCase()} · ${text("نسخة محفوظة", "Saved copy")}: ${new Date(data.savedAt).toLocaleDateString(lang)}`);
        const open = add(article, "button", text("افتح للمذاكرة", "Open for study")); open.type = "button";
        open.onclick = () => read(data.lesson, data.attribution);
        const remove = add(article, "button", text("حذف", "Remove")); remove.type = "button";
        remove.onclick = async () => { await cache.delete(key); await render(); };
      }
    } catch { $("status").textContent = text("التخزين غير متاح في المتصفح ده.", "Storage is unavailable in this browser."); }
  }
  async function privateLessons(){
    const owner=localStorage.getItem("lisan-offline-owner");if(!owner)return;
    const cache=await caches.open(PRIVATE);const keys=await cache.keys();
    const queue=[];for(const key of keys){if(new URL(key.url).pathname.startsWith("/__offline_attempt__/")){const d=await (await cache.match(key)).json();if(d.owner===owner)queue.push({key,data:d});}}
    const panel=add($("list"),"article","");add(panel,"h2",text("مركز المزامنة","Sync center"));
    add(panel,"p",text(`${queue.filter(x=>!x.data.result).length} محاولة تنتظر الاتصال والتصحيح`,`${queue.filter(x=>!x.data.result).length} attempts await connection and grading`));
    const sync=add(panel,"button",text("زامن إجاباتي الآن","Sync my answers now"));sync.type="button";
    sync.onclick=async()=>{sync.disabled=true;try{
      const session=await fetch("/api/auth/get-session",{cache:"no-store"}).then(r=>r.json());
      if(session?.user?.id!==owner)throw Error(text("سجل دخولك بنفس الحساب قبل المزامنة.","Sign in to the same account before syncing."));
      for(const entry of queue){if(entry.data.result)continue;const {attemptId,token,answers,practiceAnswers,durationSeconds,lang}=entry.data;
        const response=await fetch("/api/offline/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({attemptId,token,answers,practiceAnswers,durationSeconds,lang})});const body=await response.json();
        if(!response.ok)throw Error(({content_changed:text("اتغير محتوى الدرس. أعد تنزيله وحل النسخة الجديدة. محاولتك القديمة محفوظة للمراجعة.","Lesson content changed. Download and answer the updated lesson. Your old attempt remains saved."),track_changed:text("ارجع لمسار الدرس الأصلي ثم زامن.","Switch back to the original lesson track, then sync."),package_expired:text("صلاحية النسخة انتهت. نزّل الدرس من جديد.","Package expired. Download the lesson again.")})[body.error]||text("المزامنة لم تكتمل. إجاباتك محفوظة، أعد المحاولة بعد تسجيل الدخول.","Sync did not complete. Answers are safe; sign in and retry."));
        if(body.owner!==owner||localStorage.getItem("lisan-offline-owner")!==owner)throw Error("Account changed");
        entry.data.result=body.result;await cache.put(entry.key,new Response(JSON.stringify(entry.data)));
      }await render();
    }catch(e){add(panel,"p",e.message||text("لا يوجد اتصال. إجاباتك محفوظة.","Offline. Answers are saved."));sync.disabled=false;}};
    for(const entry of queue){const row=add(panel,"div","");add(row,"p",`${local(entry.data.title)} · ${entry.data.result?entry.data.result.score+"% · "+entry.data.result.xp+" XP":text("في الانتظار","Pending")}`);if(entry.data.result){for(const r of [...(entry.data.result.practiceResults||[]),...(entry.data.result.results||[])]){add(row,"small",`${r.correct?"✓":"✗"} ${r.expected} ${r.explain?local(r.explain):""}`);}}const remove=add(row,"button",text("حذف المحاولة","Discard attempt"));remove.onclick=async()=>{if(confirm(text("حذف المحاولة من الجهاز؟ لن يمكن استرجاعها.","Discard this device attempt? This cannot be undone."))){await cache.delete(entry.key);await render();}};}
    for(const key of keys){if(!new URL(key.url).pathname.startsWith("/__offline_package__/"))continue;const data=await(await cache.match(key)).json();if(data.owner!==owner)continue;
      const article=add($("list"),"article","");add(article,"h2",local(data.lesson.title));add(article,"small",text("درس واختبار محفوظان · التصحيح بعد الاتصال","Saved lesson and quiz · graded after reconnecting"));const open=add(article,"button",text("افتح الدرس والاختبار","Open lesson and quiz"));open.onclick=()=>{read(data.lesson,data.attribution);quiz(data,cache);};
    }
  }
  function quiz(data,cache){
    const reader=$("reader"),start=Date.now();let attemptId=crypto.randomUUID();
    add(reader,"h3",text("الاختبار المحفوظ","Offline quiz"));add(reader,"p",text("الإجابات الصحيحة لا تُخزّن على الجهاز. احفظ المحاولة ثم زامن عند الاتصال. لا تُغلق الصفحة قبل حفظ إجاباتك.","Answer keys are not stored on this device. Save your attempt, then sync online. Do not close this page before saving."));
    const answers={},practiceAnswers={};
    const questions=[...(data.lesson.exercises||[]).map(q=>({...q,practice:true})),...(data.lesson.quiz||[]).map(q=>({...q,practice:false}))];
    for(const q of questions){const values=q.practice?practiceAnswers:answers;const box=add(reader,"article","");add(box,"small",q.practice?text("تدريب، تصحيحه بعد المزامنة","Practice, graded after sync"):text("اختبار الدرس","Lesson quiz"));add(box,"p",q.type==="translate"?local(q.prompt):q.prompt&&typeof q.prompt==="string"?q.prompt:q.audio||local(q.hint));
      if(q.type==="mcq"||q.type==="listen"){if(q.audio)add(box,"p",q.audio);for(const [i,o]of q.options.entries()){const label=add(box,"label","");const input=document.createElement("input");input.type="radio";input.name=(q.practice?"practice:":"quiz:")+q.id;input.onchange=()=>values[q.id]=i;label.append(input,document.createTextNode(o));}}
      else if(q.type==="match"){values[q.id]=[];for(const [i,term]of q.left.entries()){const label=add(box,"label",term);const select=document.createElement("select");add(select,"option",text("اختر المعنى","Choose meaning")).value="";for(const r of q.right){add(select,"option",local(r)).value=r.en;}select.onchange=()=>values[q.id][i]=select.value;label.append(select);}}
      else{if(q.type==="order")add(box,"small",q.words.join(" · "));const input=document.createElement("input");input.type="text";input.dir="auto";input.maxLength=300;input.setAttribute("aria-label",q.id);input.placeholder=text("اكتب إجابتك","Your answer");input.oninput=()=>values[q.id]=input.value;box.append(input);}
    }
    const save=add(reader,"button",text("احفظ إجاباتي للمزامنة","Save answers for sync"));save.onclick=async()=>{try{if(localStorage.getItem("lisan-offline-owner")!==data.owner)throw Error("Account changed");const complete=data.lesson.quiz.every(q=>q.type==="match"?answers[q.id]?.filter(Boolean).length===q.left.length:typeof answers[q.id]==="number"||!!answers[q.id]?.trim());if(!complete){add(reader,"p",text("جاوب كل الأسئلة أولًا.","Answer every question first."));return;}
      const keys=await cache.keys();if(keys.filter(x=>new URL(x.url).pathname.startsWith("/__offline_attempt__/")).length>=100)throw Error("Queue full");
      await cache.put(`/__offline_attempt__/${attemptId}`,new Response(JSON.stringify({attemptId,owner:data.owner,trackId:data.trackId,title:data.lesson.title,token:data.token,answers,practiceAnswers:Object.fromEntries(Object.entries(practiceAnswers).filter(([,v])=>Array.isArray(v)?v.some(Boolean):typeof v==="number"||!!v.trim())),durationSeconds:Math.min(3600,Math.round((Date.now()-start)/1000)),lang})));
      save.disabled=true;attemptId=null;add(reader,"p",text("اتحفظت. ارجع للمكتبة واضغط زامن إجاباتي لما النت يرجع. لا نقاط قبل التصحيح.","Saved. Return to the library and sync when online. No XP before grading."));
      const back=add(reader,"button",text("ارجع للمكتبة","Back to library"));back.onclick=render;
    }catch{add(reader,"p",text("الحفظ لم يكتمل. تحقق من مساحة الجهاز والحساب. حد الطابور 100 محاولة.","Could not save. Check storage and account. Queue limit: 100 attempts."));}};
  }
  function read(lesson, attribution) {
    const reader = $("reader"); reader.replaceChildren(); reader.hidden = false;
    add(reader,"h2",local(lesson.title));
    for (const [label,value] of [[text("الهدف","Goal"),lesson.goal],[text("الشرح","Explanation"),lesson.explanation]]) { add(reader,"h3",label); add(reader,"p",local(value)); }
    add(reader,"h3",text("الكلمات","Vocabulary"));
    const list = add(reader,"ul","");
    for (const w of lesson.vocabulary || []) { const item=add(list,"li",""); const term=add(item,"b",w.term); term.dir="auto"; add(item,"span",` : ${local(w.meaning)}`); if(w.example) add(item,"small",w.example).dir="auto"; }
    add(reader,"h3",text("أمثلة","Examples"));
    for (const e of lesson.examples || []) {add(reader,"p",e.text).dir="auto";add(reader,"small",local(e.meaning));}
    add(reader,"h3",local(lesson.grammar?.title)); add(reader,"p",local(lesson.grammar?.body));
    if(lesson.grammar?.table) { const table=add(reader,"table",""); table.dir="ltr"; for(const row of lesson.grammar.table) {const tr=add(table,"tr",""); for(const cell of row) add(tr,"td",cell);} }
    add(reader,"h3",text("مراجعة","Review")); const review=add(reader,"ul",""); for(const r of lesson.review || []) add(review,"li",local(r));
    if (attribution?.source === "tatoeba") {
      add(reader, "h3", text("مصدر الجمل", "Sentence attribution"));
      const source = add(reader, "p", `Tatoeba · ${attribution.license}`);
      const license = add(source, "a", " CC BY 2.0 FR"); license.href="https://creativecommons.org/licenses/by/2.0/fr/"; license.rel="noreferrer";
      for (const sentence of attribution.sentences || []) {
        const p = add(reader, "small", `${sentence.by || "Tatoeba"} · `);
        if (Number.isInteger(sentence.id)) {const a=add(p,"a",`#${sentence.id}`);a.href=`https://tatoeba.org/sentences/show/${sentence.id}`;a.rel="noreferrer";}
      }
    }
    reader.scrollIntoView({behavior:"smooth"});
  }
  $("lang").onclick = () => {lang = lang === "ar" ? "en" : "ar"; history.replaceState(null,"",`?lang=${lang}`); render();};
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- standalone offline page, outside React
  $("reload").onclick = () => { location.href = `/${lang}/learn`; };
  $("clear").onclick = async () => { try {if(!confirm(text("مسح الدروس وكل الإجابات المنتظرة من الجهاز؟","Clear lessons and all pending answers from this device?")))return;await caches.delete(CACHE);await caches.delete(PRIVATE);await render();} catch {$("status").textContent=text("المسح ما اكتملش.","Could not clear storage.");} };
  render();
})();
