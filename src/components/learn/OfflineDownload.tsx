"use client";
import { useState } from "react";
import type { LessonAttribution } from "@/lib/curriculum";
import type { PublicLesson } from "@/content";

export function OfflineDownload({ lesson, language, lang, attribution }: { lesson: PublicLesson; language: string; lang: "ar" | "en"; attribution: LessonAttribution | null }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const ar = lang === "ar";
  return <aside className="card mx-auto mb-5 max-w-3xl p-4 print:hidden">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-semibold">{ar ? "خد الدرس معاك من غير نت" : "Take this lesson offline"}</h2><p className="mt-1 text-xs text-muted">{ar ? "شرح وكلمات وأمثلة وقواعد للمذاكرة. الاختبارات والنقاط والفيديو تحتاج اتصالًا." : "Study explanations, words, examples and grammar. Quizzes, points and videos need a connection."}</p></div>
      <button type="button" className="btn-ghost text-sm" disabled={state === "saving"} onClick={async () => {
        setState("saving");
        try {
          if (!("serviceWorker" in navigator)) throw new Error("unsupported");
          const registration = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
          const worker = registration.active ?? navigator.serviceWorker.controller;
          if (!worker) throw new Error("not_ready");
          const channel = new MessageChannel();
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("timeout")), 10000);
            channel.port1.onmessage = (event) => { clearTimeout(timeout); channel.port1.close(); if (event.data?.ok) resolve(); else reject(new Error("storage")); };
            // Downloaded material is public curriculum only, never a user profile,
            // learner progress, answers, session, tutor message or other private data.
            worker.postMessage({ type: "SAVE_LESSON", lesson: { id: lesson.id, title: lesson.title, goal: lesson.goal, explanation: lesson.explanation, vocabulary: lesson.vocabulary, pronunciation: lesson.pronunciation, examples: lesson.examples, grammar: lesson.grammar, review: lesson.review }, attribution, language }, [channel.port2]);
          });
          setState("saved");
        } catch { setState("error"); }
      }}>{state === "saving" ? (ar ? "جارٍ الحفظ…" : "Saving…") : state === "saved" ? (ar ? "اتحفظ على الجهاز" : "Saved on device") : (ar ? "تنزيل للمذاكرة" : "Download for study")}</button>
    </div>
    <p className="mt-2 text-xs text-faint">{ar ? "محتوى الدرس عام. النسخ المحفوظة متاحة لمستخدمي هذا المتصفح وتُمسح عند تسجيل الخروج. حد أقصى 20 درسًا." : "Lesson content is public. Saved copies are available to users of this browser and cleared on sign-out. Maximum 20 lessons."}</p>
    {state === "saved" && <a href="/offline.html" className="mt-2 inline-block text-sm font-semibold text-brand">{ar ? "افتح مكتبتي من غير نت" : "Open offline library"}</a>}
    {state === "error" && <p role="alert" className="mt-2 text-sm text-danger">{ar ? "الحفظ ما اكتملش. اتأكد إن المتصفح بيسمح بالتخزين وجرّب تاني." : "Could not save. Check browser storage access and try again."}</p>}
  </aside>;
}
