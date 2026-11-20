import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("listening: transcript, tap-to-translate, save word, comprehension score, saved on Lessons page", async ({ page }) => {
  await signUp(page, "ar", "هدى", uniqueEmail("listen"));
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "السفر", minutes: "15 دقيقة", level: "A2" });

  await page.goto("/ar/learn");
  await page.getByTestId("center-listening").click();
  await page.waitForURL("**/ar/learn/listening");
  await page.getByTestId("text-en-l-directions").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("السؤال عن الطريق");

  await expect(page.getByTestId("interactive-text")).toHaveCount(0); // hidden by default for listening
  await page.getByRole("button", { name: "إظهار النص" }).click();
  await page.getByTestId("interactive-text").getByRole("button", { name: "pharmacy" }).first().click();
  const pop = page.getByTestId("word-popover");
  await expect(pop).toContainText("صيدلية");
  await pop.getByRole("button", { name: "احفظ في كلماتي" }).click();
  await expect(pop.getByRole("button", { name: "تم الحفظ" })).toBeVisible();
  // Multi-word phrase is one token.
  await page.getByTestId("interactive-text").getByRole("button", { name: "traffic lights" }).click();
  await expect(pop).toContainText("إشارة المرور");

  await page.getByTestId("tq-q1").getByRole("radio", { name: "A pharmacy" }).click();
  await page.getByTestId("tq-q2").getByRole("radio", { name: "At the traffic lights" }).click();
  await page.getByTestId("tq-q3").getByRole("radio", { name: "One hour" }).click();
  await page.getByRole("button", { name: "تحقق من الإجابات" }).click();
  await expect(page.getByText("نتيجتك: 2 من 3")).toBeVisible();

  await page.goto("/ar/learn");
  await expect(page.getByTestId("saved-words")).toContainText("pharmacy");
});

test("reading shows the text immediately", async ({ page }) => {
  await signUp(page, "en", "Rae", uniqueEmail("read"));
  await onboard(page, { native: "Arabic", target: "German", goal: "Daily life", minutes: "15 min", level: "A1" });
  await page.goto("/en/learn/reading");
  await page.getByTestId("text-de-r-tag").click();
  await expect(page.getByTestId("interactive-text")).toContainText("Köln");
  await page.getByTestId("interactive-text").getByRole("button", { name: "stehe" }).click();
  await expect(page.getByTestId("word-popover")).toContainText("separable verb");
});

test("writing assistant: submit → feedback with corrections and versions (test provider)", async ({ page }) => {
  await signUp(page, "en", "Wes", uniqueEmail("write"));
  await onboard(page, { native: "Arabic", target: "English", goal: "Work", minutes: "15 min", level: "B1" });
  await page.goto("/en/learn/writing");
  await expect(page.getByTestId("ai-status")).toContainText("Test mode");
  await page.getByTestId("task-w-intro").click();
  await page.getByLabel("Your text").fill("Hello! My name is Wes. I has a small cat and I work in a bank in Cairo. I like football.");
  await page.getByRole("button", { name: "Assess my writing" }).click();
  await page.waitForURL(/\/en\/learn\/writing\/[0-9a-f-]{36}$/);
  const fb = page.getByTestId("writing-feedback");
  await expect(fb).toContainText("I have a small cat");
  await expect(fb).toContainText("Professional version");
  await page.goto("/en/learn/writing");
  await expect(page.getByText("Your previous writing")).toBeVisible();
});

test("pronunciation: fake microphone → WAV → API → per-word scores (test provider)", async ({ page }) => {
  await signUp(page, "en", "Pia", uniqueEmail("pron"));
  await onboard(page, { native: "Arabic", target: "English", goal: "Work", minutes: "15 min", level: "A1" });
  await page.goto("/en/learn/pronunciation");
  await expect(page.getByTestId("speech-status")).toContainText("Test mode");
  await page.getByTestId("record").click();
  await expect(page.getByRole("button", { name: /Stop and send/ })).toBeVisible();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Stop and send/ }).click();
  const res = page.getByTestId("pron-result");
  await expect(res).toBeVisible();
  await expect(res).toContainText("86"); // overall (scripted)
  await expect(res).toContainText("Not measured for this language"); // prosody null is shown honestly
  await expect(res.getByRole("button", { name: /my/ })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Recent attempts")).toBeVisible();
});
