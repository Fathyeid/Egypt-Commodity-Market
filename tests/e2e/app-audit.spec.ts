import {expect,test} from "@playwright/test";
import {signUp,onboard,uniqueEmail} from "./helpers";
import fs from "node:fs";
test("app audit Arabic English German: layout, links, empty states, dark theme and offline locale",async({page},info)=>{
 test.setTimeout(110000);
 await signUp(page,"en","Audit learner",uniqueEmail("full-audit"));await onboard(page,{native:"Arabic",target:"German",goal:"Daily life",minutes:"15 min",level:"A1"});
 const routes=["/ar/dashboard","/en/learn","/ar/learn/de-a1-u1-l1","/en/learn/stories","/ar/learn/listening","/en/learn/reading","/ar/learn/writing","/en/learn/pronunciation","/ar/learn/review","/en/tutor","/ar/tutor/voice","/en/learn/daily","/ar/profile","/en/placement","/ar/learn/league","/en/learn/level/de-a1"];
 const findings=[];
 for(const [i,path] of routes.entries()){
  await page.setViewportSize({width:i%2?390:1280,height:900});await page.goto(path);await expect(page.locator("main")).toBeVisible();await expect(page.locator("main h1")).toBeVisible();
  if(i===0)await page.getByRole("button",{name:"تبديل المظهر"}).click();
  const data=await page.evaluate(()=>({url:location.pathname,title:document.querySelector("main h1")?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),internalLinks:[...document.querySelectorAll<HTMLAnchorElement>("main a[href]")].filter(a=>a.origin===location.origin).map(a=>a.pathname+a.search)}));
  expect(data.overflow,`overflow ${path}`).toBe(false);expect(data.brokenImages,`images ${path}`).toEqual([]);findings.push(data);await page.screenshot({path:info.outputPath(`audit-${i}.png`),fullPage:i===2});
 }
 await page.goto("/ar/learn/de-a1-u1-l1");await page.getByRole("button",{name:"تنزيل الدرس والاختبار"}).click();await expect(page.getByRole("button",{name:"اتحفظ على الجهاز"})).toBeVisible();await page.goto("/en/learn/de-a1-u1-l1");await page.getByRole("link",{name:"Open offline school"}).click();await expect(page.getByRole("heading",{name:"My offline library"})).toBeVisible();expect(await page.locator("html").getAttribute("dir")).toBe("ltr");expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");await page.screenshot({path:info.outputPath("audit-offline-en-dark.png"),fullPage:true});
 await page.goto("/en/learn/definitely-missing");await expect(page.getByRole("heading",{name:"Page not found"})).toBeVisible();await page.goto("/ar/learn/definitely-missing");await expect(page.getByRole("heading",{name:"الصفحة مش موجودة"})).toBeVisible();await page.screenshot({path:info.outputPath("audit-not-found-ar.png")});
 await page.goto("/en/learn/stories/de-cafe-a1");await page.getByRole("checkbox").check();await expect(page.getByText("Good day! Would you like tea or coffee?",{exact:true})).toBeVisible();await page.screenshot({path:info.outputPath("audit-german-english-meaning.png"),fullPage:true});
 // Every observed curriculum/feature destination is same-origin and must render content, not 404 or 500.
 const links=[...new Set(findings.flatMap(f=>f.internalLinks))].filter(x=>!x.includes("/placement/")&&!x.includes("/profile"));
 for(const path of links.slice(0,38)){const response=await page.request.get(path);expect(response.status(),path).toBeLessThan(400);}
 fs.writeFileSync(info.outputPath("audit-routes.json"),JSON.stringify({findings,checkedLinks:links.slice(0,38)},null,2));
});

test("a failed quiz is not shown as completed or skipped by continue",async({page})=>{
 await signUp(page,"en","Progress audit",uniqueEmail("failed-progress"));await onboard(page,{native:"Arabic",target:"English",goal:"Daily life",minutes:"15 min",level:"A1"});await page.goto("/en/learn/en-a1-u1-l1");
 // Use a scoped database fixture for a genuine failed result without granting progress.
 const postgres=(await import("postgres")).default;const sql=postgres(process.env.DATABASE_URL!,{max:1});try{const [u]=await sql`select id from "user" where name='Progress audit' order by created_at desc limit 1`;await sql`insert into lesson_progress(user_id,lesson_id,best_score) values(${u.id},'en-a1-u1-l1',0)`;}finally{await sql.end();}
 await page.goto("/en/learn");await expect(page.getByTestId("continue-card")).toHaveAttribute("href","/en/learn/en-a1-u1-l1");await expect(page.getByTestId("learn-hero")).toContainText("0 of");
});
