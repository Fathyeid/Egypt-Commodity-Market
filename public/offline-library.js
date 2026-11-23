/* Offline public study reader. All curriculum text is inserted as text, never HTML. */
(() => {
  const CACHE = "lisan-public-lessons-v1";
  let lang = "ar";
  const $ = (id) => document.getElementById(id);
  const text = (ar, en) => lang === "ar" ? ar : en;
  const local = (value) => typeof value === "string" ? value : value?.[lang] ?? "";
  const add = (parent, tag, value) => { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; };
  async function render() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("lang").textContent = text("English", "العربية");
    $("title").textContent = text("مكتبتي من غير نت", "My offline library");
    $("note").textContent = text("نسخ للمذاكرة فقط. الاختبارات والنقاط والفيديو تحتاج اتصالًا. المحتوى المحفوظ عام ومتاح لمستخدمي المتصفح، ولا تُحفظ بيانات حسابك هنا.", "Study copies only. Quizzes, points and videos need a connection. Saved curriculum is public and available to users of this browser. No account details are saved here.");
    $("reload").textContent = text("إعادة المحاولة أونلاين", "Try online again");
    $("clear").textContent = text("مسح الدروس المحفوظة", "Clear saved lessons");
    $("list").replaceChildren(); $("reader").hidden = true;
    try {
      const cache = await caches.open(CACHE);
      const keys = await cache.keys();
      $("status").textContent = keys.length ? text(`${keys.length} درس محفوظ على الجهاز`, `${keys.length} lessons saved on this device`) : text("مفيش دروس محفوظة لسه. افتح درس وأنت أونلاين واضغط تنزيل للمذاكرة.", "No saved lessons yet. Open a lesson while online and choose Download for study.");
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
  $("lang").onclick = () => {lang = lang === "ar" ? "en" : "ar"; render();};
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- standalone offline page, outside React
  $("reload").onclick = () => { location.href = `/${lang}/learn`; };
  $("clear").onclick = async () => { try {await caches.delete(CACHE);await render();} catch {$("status").textContent=text("المسح ما اكتملش.","Could not clear storage.");} };
  render();
})();
