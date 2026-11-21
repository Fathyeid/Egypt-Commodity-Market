import { expect, test } from "@playwright/test";
import postgres from "postgres";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("smart review budgets, previews intervals, skips a stale tab without extra XP, and pauses", async ({ page, context }, testInfo) => {
  const email = uniqueEmail("smart-review");
  await signUp(page, "ar", "سلمى", email);
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "السفر", minutes: "15 دقيقة", level: "A2" });
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const [user] = await sql`select id from "user" where email=${email}`;
    for (let i = 0; i < 12; i++) await sql`insert into saved_words (user_id, language, term, meaning, source, due_at) values (${user.id}, 'en', ${`word-${i}`}, 'كلمة للتجربة', 'listening', ${new Date(Date.now() - 100000 + i).toISOString()})`;
    await page.goto("/ar/learn/review?minutes=2");
    await expect(page.getByTestId("review-card")).toContainText("بطاقة 1 من 8");
    const other = await context.newPage();
    await other.goto("/ar/learn/review?minutes=2");
    await page.getByTestId("reveal").click();
    await other.getByTestId("reveal").click();
    await expect(page.getByTestId("grade-again")).toContainText("10 دقائق");
    await expect(page.getByTestId("grade-good")).toContainText("1 يوم");
    await page.screenshot({ path: testInfo.outputPath("smart-review-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: testInfo.outputPath("smart-review-mobile.png"), fullPage: true });
    await page.getByTestId("grade-good").click();
    await expect(page.getByTestId("review-card")).toContainText("بطاقة 2 من 8");
    await other.getByTestId("grade-easy").click();
    await expect(other.getByTestId("review-card")).toContainText("لم تُضف نقاط مكررة");
    const [reward] = await sql`select count(*)::int as n, sum(xp)::int as xp from activity_events where user_id=${user.id} and kind='review'`;
    expect(reward).toEqual({ n: 1, xp: 2 });
    await page.getByTestId("review-pause").click();
    await expect(page.getByTestId("review-done")).toContainText("تذكرت 1 من 1");
    await expect(page.getByTestId("review-next")).toContainText("UTC");
    await page.goto("/ar/learn/review?minutes=5");
    await expect(page.getByTestId("review-card")).toContainText("بطاقة 1 من 11");
    await expect(page.getByTestId("review-budget").getByRole("link", { name: "5 دقائق", exact: true })).toHaveAttribute("aria-current", "page");
    await other.close();
  } finally { await sql.end(); }
});
