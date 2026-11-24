import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("placement test: 16 adaptive questions → per-skill report → dashboard shows the levels", async ({ page }) => {
  await signUp(page, "en", "Tess", uniqueEmail("placement"));
  await onboard(page, { native: "Arabic", target: "English", goal: "Work", minutes: "15 min", level: "A2" });

  await page.getByRole("button", { name: "Start the test" }).click();
  await page.waitForURL(/\/en\/placement\/[0-9a-f-]{36}$/);
  for (let n = 1; n <= 16; n++) {
    await expect(page.getByText(`Question ${n} of 16`)).toBeVisible();
    await page.getByRole("radio").first().click();
    await page.getByTestId("placement-submit").click();
    if (n < 16) await expect(page.getByText(`Question ${n + 1} of 16`)).toBeVisible();
  }
  await page.waitForURL(/\/en\/placement$/);
  await expect(page.getByText("Your overall level", { exact: true })).toBeVisible();
  await expect(page.getByTestId("overall-level")).toHaveText(/^(A0|A1|A2|B1|B2|C1)$/);
  await expect(page.getByText("Not assessed yet")).toHaveCount(3); // writing, speaking, pronunciation are honest about it
  await expect(page.getByRole("button", { name: "Retake the test" })).toBeVisible();

  await page.goto("/en/dashboard");
  await expect(page.getByText(/Your tested level: (A0|A1|A2|B1|B2|C1)/)).toBeVisible();
  await expect(page.getByRole("link", { name: "View report" })).toBeVisible();
});

test("lesson: 8 sections, practice feedback, server-graded quiz, progress saved", async ({ page }) => {
  await signUp(page, "ar", "رنا", uniqueEmail("lesson"));
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "السفر", minutes: "15 دقيقة", level: "A1" });

  await page.getByRole("link", { name: "متابعة الدرس" }).click();
  await page.waitForURL("**/ar/learn/en-a1-u1-l1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("التحية والتعارف");
  const sections = ["شرح الدرس", "كلمات جديدة", "النطق", "أمثلة", "القواعد", "تمارين", "اختبار قصير", "مراجعة"];
  for (const s of sections) await expect(page.getByRole("button", { name: new RegExp(s) }).first()).toBeVisible();

  // Practice: wrong answer → explained feedback.
  await page.getByRole("button", { name: /تمارين/ }).first().click();
  const e1 = page.getByTestId("exercise-e1");
  await e1.getByRole("radio", { name: "is" }).click();
  await e1.getByRole("button", { name: "تحقق" }).click();
  await expect(e1.getByRole("status")).toContainText("ليست صحيحة");
  await expect(e1.getByRole("status")).toContainText("am");
  await e1.getByRole("radio", { name: "am" }).click();
  await e1.getByRole("button", { name: "تحقق" }).click();
  await expect(e1.getByRole("status")).toContainText("إجابة صحيحة");

  // Quiz: all correct.
  await page.getByRole("button", { name: /اختبار قصير/ }).first().click();
  await page.getByTestId("quiz-q1").getByRole("radio", { name: "are" }).click();
  await page.getByTestId("quiz-q2").getByRole("textbox").fill("is");
  await page.getByTestId("quiz-q3").getByRole("textbox").fill("I'm Sara");
  await page.getByTestId("quiz-q4").getByRole("textbox").fill("Good morning");
  await page.getByRole("button", { name: "تسليم الاختبار" }).click();
  await expect(page.getByText("نتيجتك: 100% (4 من 4)")).toBeVisible();
  await expect(page.getByText("+18 نقطة خبرة")).toBeVisible();

  await page.goto("/ar/learn");
  await expect(page.getByTestId("learn-hero")).toContainText(/أنجزت 1 من \d+ درس/);
  await expect(page.getByTestId("lesson-en-a1-u1-l1")).toContainText("أفضل نتيجة 100%");

  await page.goto("/ar/dashboard");
  const words = page.locator("section[aria-label=KPIs] > div").nth(1);
  await expect(words).toContainText("0"); // learned only after surviving a day of spaced review
  await expect(page.getByTestId("review-cta")).toContainText("6"); // the lesson's 6 words are due for review
  await expect(page.getByText("لا يوجد نشاط مسجّل بعد")).toHaveCount(0);
});

test("lessons of another language are refused; unknown lessons show not-found", async ({ page }) => {
  await signUp(page, "en", "Gus", uniqueEmail("guard"));
  await onboard(page, { native: "Arabic", target: "English", goal: "Daily life", minutes: "5 min", level: "A0" });
  await page.goto("/en/learn/de-a1-u1-l1");
  await expect(page.getByText("This lesson isn't in your active language.")).toBeVisible();
  // The page shell streams first, so the status can't change mid-stream; Next renders the
  // not-found UI and marks the page noindex instead.
  await page.goto("/en/learn/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
});
