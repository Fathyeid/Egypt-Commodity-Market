import {expect,test} from "@playwright/test";
import postgres from "postgres";
import {onboard,signUp,uniqueEmail} from "./helpers";

test("voice session: microphone transcript review, reply, report and reload",async({page},info)=>{
 await page.addInitScript(()=>{
 class Recognition {lang="";continuous=false;interimResults=false;maxAlternatives=1;onresult:((e:unknown)=>void)|null=null;onend:(()=>void)|null=null;onerror=null;start(){this.onresult?.({results:[[{transcript:"I work in a small team and enjoy helping customers"}]]});this.onend?.();}stop(){this.onend?.();}abort(){} }
 Object.defineProperty(window,"SpeechRecognition",{value:Recognition,configurable:true});
 });
 await signUp(page,"ar","متعلم الحصة",uniqueEmail("voice"));await onboard(page,{native:"العربية",target:"الإنجليزية",goal:"العمل",minutes:"15 دقيقة",level:"A2"});
 await page.goto("/ar/tutor/voice");await expect(page.getByRole("heading",{level:1})).toHaveText("اتكلم أكتر. اتردد أقل.");await page.screenshot({path:info.outputPath("voice-hub-desktop.png"),fullPage:true});await page.getByRole("article").filter({has:page.getByRole("heading",{name:"مقابلة عمل",exact:true})}).getByRole("button",{name:"ابدأ الحصة"}).click();
 await expect(page.getByTestId("voice-session")).toBeVisible();await page.screenshot({path:info.outputPath("voice-session-desktop.png"),fullPage:true});
 await page.getByRole("checkbox").uncheck();
 await page.getByTestId("voice-mic").click();
 await expect(page.getByRole("textbox")).toHaveValue(/small team/);
 await expect(page.getByTestId("finish-voice")).toBeDisabled();
 await page.getByRole("textbox").fill("I work in a small team.");
 await page.getByRole("button",{name:"ابعت الرد"}).click();
 await expect(page.getByText("ردود منك في الحصة")).toBeVisible();
 await expect(page.getByRole("textbox")).toHaveValue("");
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.screenshot({path:info.outputPath("voice-mobile.png"),fullPage:true});
 await page.getByTestId("finish-voice").click();await expect(page.getByText(/test role-play|تقرير المحادثة|ملخص/).first()).toBeVisible();
 await expect(page.getByTestId("finish-voice")).toHaveCount(0);await page.reload();await expect(page.getByTestId("finish-voice")).toHaveCount(0);
 await expect(page.getByRole("link",{name:"ادخل مدرستي اليومية"})).toBeVisible();
});

test("daily school prioritizes weak lessons, repairs real mistakes, and saves evidence",async({page},info)=>{
 const email=uniqueEmail("daily");await signUp(page,"ar","متعلم يومي",email);await onboard(page,{native:"العربية",target:"الإنجليزية",goal:"العمل",minutes:"15 دقيقة",level:"A1"});
 const sql=postgres(process.env.DATABASE_URL!,{max:1});let mistakeId:string;
 try{const [u]=await sql`select id from "user" where email=${email}`;const [t]=await sql`select id from learning_tracks where user_id=${u.id} and is_active=true`;
 await sql`insert into lesson_progress(user_id,lesson_id,best_score) values(${u.id},'en-a1-u1-l2',40)`;
 await sql`insert into saved_words(user_id,language,term,meaning,source) values(${u.id},'en','ready','جاهز','test')`;
 const [m]=await sql`insert into error_log(user_id,track_id,source,category,rule_tag,original,corrected,explanation) values(${u.id},${t.id},'tutor','grammar','be','He are ready','He is ready','Use is with he') returning id`;mistakeId=m.id;
 }finally{await sql.end();}
 await page.goto("/ar/learn/daily");await expect(page.getByTestId("start-daily")).toBeVisible();await page.screenshot({path:info.outputPath("daily-plan-desktop.png"),fullPage:true});await expect(page.getByText("نقوّي الدرس الضعيف",{exact:true})).toBeVisible();await page.getByTestId("start-daily").click();
 await expect(page.getByTestId("review-card")).toBeVisible();await page.getByTestId("reveal").click();await page.getByTestId("grade-good").click();await expect(page.getByTestId("review-done")).toBeVisible();await page.getByRole("button",{name:"كمل الحصة"}).click();
 await expect(page.getByTestId("mistake-lab")).toBeVisible();await page.getByRole("textbox").fill("He are ready");await page.getByRole("button",{name:"راجع إجابتي"}).click();await expect(page.getByText(/مش نفس التصحيح/)).toBeVisible();
 await page.getByRole("textbox").fill("He is ready");await page.getByRole("button",{name:"راجع إجابتي"}).click();await expect(page.getByText("صحيح، أصلحتها")).toBeVisible();await page.getByRole("button",{name:"التالي",exact:true}).click();await page.getByRole("button",{name:"كمل الحصة"}).click();
 await expect(page.getByRole("heading",{name:"الأرقام والعمر",exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.screenshot({path:info.outputPath("daily-mobile.png"),fullPage:true});
 const read=postgres(process.env.DATABASE_URL!,{max:1});try{const rows=await read`select correct from exercise_attempts where exercise_id=${mistakeId!} order by created_at`;expect(rows.map(x=>x.correct)).toEqual([false,true]);}finally{await read.end();}
 await page.reload();await expect(page.getByText("مختبر أخطائي",{exact:true})).toHaveCount(0);
});


test("daily school completes an integrated lesson and summary without bonus XP",async({page},info)=>{
 await signUp(page,"en","Daily learner",uniqueEmail("daily-finish"));await onboard(page,{native:"Arabic",target:"English",goal:"Daily life",minutes:"15 min",level:"A1"});
 await page.goto("/en/learn/daily");await page.getByTestId("start-daily").click();
 await page.getByRole("button",{name:/Quick quiz/}).first().click();
 await page.getByTestId("quiz-q1").getByRole("radio",{name:"are"}).click();
 await page.getByTestId("quiz-q2").getByRole("textbox").fill("is");
 await page.getByTestId("quiz-q3").getByRole("textbox").fill("I'm Sara");
 await page.getByTestId("quiz-q4").getByRole("textbox").fill("Good morning");
 await page.getByRole("button",{name:/Submit quiz/}).click();
 await page.getByRole("button",{name:"Continue session",exact:true}).click();
 await expect(page.getByTestId("daily-done")).toContainText("100%");
 await page.screenshot({path:info.outputPath("daily-summary.png"),fullPage:true});
 await page.goto("/en/dashboard");await expect(page.getByTestId("review-cta")).toContainText("6");
});


test("voice fallback works without speech support, and another learner cannot open a session",async({page,browser})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,"SpeechRecognition",{value:undefined,configurable:true});Object.defineProperty(window,"webkitSpeechRecognition",{value:undefined,configurable:true});});
 await signUp(page,"en","Voice learner",uniqueEmail("voice-fallback"));await onboard(page,{native:"Arabic",target:"English",goal:"Work",minutes:"15 min",level:"A1"});
 await page.goto("/en/tutor/voice");await page.getByRole("article").filter({has:page.getByRole("heading",{name:"Social small talk",exact:true})}).getByRole("button",{name:"Start session",exact:true}).click();
 await expect(page.getByTestId("voice-mic")).toBeDisabled();await expect(page.getByText(/This browser does not support speech recognition/)).toBeVisible();
 const url=page.url();const ctx=await browser.newContext();const other=await ctx.newPage();await signUp(other,"en","Other learner",uniqueEmail("voice-other"));await onboard(other,{native:"Arabic",target:"English",goal:"Work",minutes:"15 min",level:"A1"});await other.goto(url);await expect(other.getByRole("heading",{name:"This page could not be found."})).toBeVisible();await ctx.close();
});
