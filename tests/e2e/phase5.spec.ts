import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("spaced review: a saved word is due, graded, then scheduled away; dashboard shows level, goal and badges", async ({ page }) => {
  await signUp(page, "ar", "سلمى", uniqueEmail("srs"));
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "السفر", minutes: "15 دقيقة", level: "A2" });

  await page.goto("/ar/learn/review");
  await expect(page.getByTestId("review-empty")).toContainText("مجموعتك فارغة");

  // Save a word from a listening text.
  await page.goto("/ar/learn/listening/en-l-directions");
  await page.getByRole("button", { name: "إظهار النص" }).click();
  await page.getByTestId("interactive-text").getByRole("button", { name: "pharmacy" }).first().click();
  await page.getByTestId("word-popover").getByRole("button", { name: "احفظ في كلماتي" }).click();
  await expect(page.getByTestId("word-popover").getByRole("button", { name: "تم الحفظ" })).toBeVisible();

  await page.goto("/ar/learn");
  await expect(page.getByTestId("learn-review")).toContainText("1 للمراجعة الآن");
  await page.getByTestId("learn-review").click();
  await page.waitForURL("**/ar/learn/review");
  const card = page.getByTestId("review-card");
  await expect(card).toContainText("pharmacy");
  await page.getByTestId("reveal").click();
  await expect(page.getByTestId("review-meaning")).toContainText("صيدلية");
  await page.getByTestId("grade-good").click();
  await expect(page.getByTestId("review-done")).toContainText("تذكرت 1 من 1");

  await page.reload();
  await expect(page.getByTestId("review-empty")).toContainText("لا توجد كلمات تحتاج مراجعة الآن");

  await page.goto("/ar/dashboard");
  await expect(page.getByTestId("xp-level")).toContainText("المستوى 1");
  await expect(page.getByTestId("daily-goal")).toContainText("/ 15 دقيقة");
  await expect(page.getByTestId("review-cta")).toContainText("1 كلمة في مجموعتك");
  await expect(page.getByTestId("badges").locator('[data-earned="true"]')).toHaveCount(0);
});

test("learning path shows connected lessons and a unit test at the end of each unit", async ({ page }) => {
  await signUp(page, "en", "Pat", uniqueEmail("path"));
  await onboard(page, { native: "Arabic", target: "German", goal: "Daily life", minutes: "15 min", level: "A1" });
  await page.goto("/en/learn");
  const unit = page.getByTestId("unit-de-a1-u1");
  await expect(unit).toHaveAttribute("open", "");
  await expect(unit.locator('[data-testid^="lesson-"]').first()).toContainText("Start");
  await unit.getByTestId("checkpoint-de-a1-u1").click();
  await page.waitForURL("**/en/learn/checkpoint/de-a1-u1");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Unit test");
  await expect(page.getByTestId("cp-0")).toBeVisible();
  await expect(page.getByTestId("cp-submit")).toBeDisabled();
  await page.goto("/en/learn/checkpoint/not-a-unit");
  await expect(page.getByTestId("cp-0")).toHaveCount(0);
});
