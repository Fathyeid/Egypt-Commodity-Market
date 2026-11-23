import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("work practice, saved conversation words and offline study copies", async ({page,context})=>{
 await signUp(page,"ar","متعلم تجريبي",uniqueEmail("remaining"));
 await onboard(page,{native:"العربية",target:"الإنجليزية",goal:"العمل",minutes:"15 دقيقة",level:"A2"});
 await page.goto("/ar/tutor");
 await expect(page.getByTestId("work-practice")).toBeVisible();
 await page.screenshot({path:"/downloads/lisan-work-preview/work-live-desktop.png",fullPage:true});
 await page.getByRole("button",{name:/تحديث لعميل/}).click();
 await expect(page.getByRole("heading",{name:/مهمتك في المحادثة/})).toContainText("تحديث لعميل");
 await page.getByTestId("start-roleplay-customer_update").click();
 await expect(page.getByRole("heading",{level:1})).toHaveText("تحديث لعميل");
 await page.goto("/ar/tutor"); await page.getByTestId("start-tutor-friendly").click();
 await page.getByRole("textbox",{name:"اكتب رسالتك…"}).fill("Hello");await page.getByRole("button",{name:"إرسال",exact:true}).click();
 await page.getByRole("button",{name:"احفظ للمراجعة"}).click();
 await expect(page.getByRole("button",{name:"اتحفظت للمراجعة"})).toBeDisabled();
 await page.goto("/ar/learn");await expect(page.getByText("weekend",{exact:true})).toBeVisible();
 await page.goto("/ar/learn/en-a1-u1-l1");
 await page.getByRole("button",{name:"تنزيل للمذاكرة"}).click();
 await expect(page.getByRole("button",{name:"اتحفظ على الجهاز"})).toBeVisible();
 await page.getByRole("link",{name:"افتح مكتبتي من غير نت"}).click();
 await expect(page.getByRole("button",{name:"افتح للمذاكرة"})).toBeVisible();
 const stored = await page.evaluate(async()=>{ const c=await caches.open("lisan-public-lessons-v1");const [key]=await c.keys();return await (await c.match(key))!.json(); });
 expect(stored.lesson.quiz).toBeUndefined();expect(stored.lesson.exercises).toBeUndefined();
 expect(stored.userId).toBeUndefined();expect(stored.progress).toBeUndefined();
 await context.setOffline(true);await page.reload();
 await page.getByRole("button",{name:"افتح للمذاكرة"}).click();
 await expect(page.locator("#reader")).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:"/downloads/lisan-work-preview/offline-mobile.png",fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await context.setOffline(false);await page.goto("/ar/learn");
 await page.getByRole("button",{name:"تسجيل الخروج"}).click();
 await page.waitForURL("**/ar");
 expect(await page.evaluate(async()=>{const c=await caches.open("lisan-public-lessons-v1");return(await c.keys()).length;})).toBe(0);
});

test("certificate gates completion, signed verification and tamper rejection",async({page})=>{
 const email=uniqueEmail("certificate");await signUp(page,"ar","متعلم تجريبي",email);
 await onboard(page,{native:"العربية",target:"الإنجليزية",goal:"العمل",minutes:"15 دقيقة",level:"A2"});
 await page.goto("/ar/learn/certificate/en-a1-u1");await expect(page.getByText(/كمّل كل دروس الوحدة/)).toBeVisible();
 const sql=postgres(process.env.DATABASE_URL!,{max:1});
 try {
 const [u]=await sql`select id from "user" where email=${email}`;
 const rows=await sql`select id from curriculum_lessons where unit_id='en-a1-u1' and status='published'`;
 for(const id of [...rows.map(r=>r.id),"checkpoint:en-a1-u1"]) await sql`insert into lesson_progress(user_id,lesson_id,best_score) values(${u.id},${id},80)`;
 } finally {await sql.end();}
 await page.reload();await expect(page.getByTestId("certificate")).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:"/downloads/lisan-work-preview/certificate-mobile.png",fullPage:true});
 await page.setViewportSize({width:1280,height:900});
 await page.screenshot({path:"/downloads/lisan-work-preview/certificate-desktop.png",fullPage:true});
 await page.pdf({path:"/downloads/lisan-work-preview/certificate-print.pdf",format:"A4",printBackground:true});
 await page.getByRole("button",{name:"إنشاء رابط تحقق قابل للمشاركة"}).click();
 const link=await page.getByRole("textbox",{name:"رابط التحقق"}).inputValue();
 const fresh = await page.context().browser()!.newContext();
 const viewer=await fresh.newPage();await viewer.goto(link);await expect(viewer.getByText(/التوقيع الرقمي صحيح/)).toBeVisible();
 await viewer.goto(link+"x");await expect(viewer.getByText("رابط الشهادة غير صالح أو تغيّر توقيع الإصدار.")).toBeVisible();
 await fresh.close();
});

test("work practice fits mobile English and Arabic without changing the app design",async({page})=>{
 await signUp(page,"en","Visual learner",uniqueEmail("mobile-work"));
 await onboard(page,{native:"Arabic",target:"English",goal:"Work",minutes:"15 min",level:"A2"});
 await page.setViewportSize({width:390,height:844});
 await page.goto("/en/tutor");
 await page.getByRole("button",{name:/Team progress update/}).click();
 await expect(page.getByRole("heading",{name:/Your conversation goals/})).toContainText("Team progress update");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:"/downloads/lisan-work-preview/work-mobile-en.png",fullPage:true});
 await page.goto("/ar/tutor");await page.getByRole("button",{name:/تحديث لفريق الشغل/}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:"/downloads/lisan-work-preview/work-mobile-ar.png",fullPage:true});
});
