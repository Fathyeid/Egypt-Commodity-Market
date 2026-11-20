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
