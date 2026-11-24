import {test,expect} from '@playwright/test';
import {signUp,onboard,uniqueEmail} from './helpers';
test('German Arabic meanings, safe note and English preserved on desktop and phone',async({page},info)=>{
 test.setTimeout(90000);
 // CI imports factory content as drafts. Publish only the two local fixture lessons.
 const postgres=(await import('postgres')).default;const sql=postgres(process.env.DATABASE_URL!,{max:1});try{await sql`update curriculum_lessons set status='published' where id in ('de-a1-f-greetings-1','de-a1-f-greetings-2')`;}finally{await sql.end();}
 await signUp(page,'en','Translation audit',uniqueEmail('translation'));await onboard(page,{native:'Arabic',target:'German',goal:'Daily life',minutes:'15 min',level:'A1'});
 await page.goto('/ar/learn/de-a1-f-greetings-1');await page.getByRole('button',{name:'4. أمثلة',exact:true}).click();await expect(page.getByText('اسمه كين.',{exact:true}).first()).toBeVisible();await expect(page.getByTestId('german-translation-note')).toContainText('وقد تخطئ');
 await page.screenshot({path:info.outputPath('german-ar-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto('/ar/learn/de-a1-f-greetings-2');await page.getByRole('button',{name:'4. أمثلة',exact:true}).click();await expect(page.getByText('اسمي ليس توم.',{exact:true}).first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.screenshot({path:info.outputPath('german-ar-phone.png'),fullPage:true});
 await page.goto('/en/learn/de-a1-f-greetings-1');await page.getByRole('button',{name:'4. Examples',exact:true}).click();await expect(page.getByText('His name is Ken.',{exact:true}).first()).toBeVisible();
});
