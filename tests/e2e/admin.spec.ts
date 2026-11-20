import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("the admin panel is invisible to learners", async ({ page }) => {
  await signUp(page, "en", "Lea", uniqueEmail("notadmin"));
  await page.goto("/en/admin");
  await expect(page.getByRole("heading", { name: "Admin" })).toHaveCount(0);
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
});

test("admin reviews a factory lesson, publishes it and attaches a topic video", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL!;
  await signUp(page, "en", "Admin", email);
  await onboard(page, { native: "Arabic", target: "Italian", goal: "Daily life", minutes: "15 min", level: "A1" });

  await page.goto("/en/profile");
  await page.getByTestId("admin-link").click();
  await page.waitForURL("**/en/admin");
  await expect(page.getByTestId("admin-lang-it")).toBeVisible();
  await page.getByTestId("review-it-a1").click();
  await page.waitForURL("**/en/admin/courses/it-a1?status=draft");

  const first = page.locator('[data-testid^="admin-lesson-"]').first();
  const lessonId = (await first.getAttribute("data-testid"))!.replace("admin-lesson-", "");
  // Drafts are invisible to learners.
  await page.goto("/en/learn");
  await expect(page.getByTestId(`lesson-${lessonId}`)).toHaveCount(0);
  await page.goto(`/en/learn/${lessonId}`);
  await expect(page.getByTestId("attribution")).toHaveCount(0);
  await page.goto(`/en/admin/lessons/${lessonId}`);
  await page.waitForURL(`**/en/admin/lessons/${lessonId}`);
  await expect(page.getByText("Correct answers:").first()).toBeVisible();
  await page.getByTestId(`set-published-${lessonId}`).first().click();
  await expect(page.getByText("Published", { exact: true }).first()).toBeVisible();

  // Now the learner sees it, with Tatoeba attribution.
  await page.goto("/en/learn");
  await page.getByTestId(`lesson-${lessonId}`).click();
  await page.waitForURL(`**/en/learn/${lessonId}`);
  await expect(page.getByTestId("attribution")).toContainText("Tatoeba");

  // Topic with a YouTube video, approved and attached to the lesson's unit.
  const topicId = `it-a1-g-e2e-${Date.now()}`;
  await page.goto("/en/admin/topics");
  const form = page.getByTestId("topic-form");
  await form.getByLabel("Id (e.g. de-a1-g-articles)").fill(topicId);
  await form.getByLabel("Language").selectOption("it");
  await form.getByLabel("Title (Arabic)").fill("أدوات التعريف");
  await form.getByLabel("Title (English)").fill("Articles");
  await form.getByLabel("Explanation (English)").fill("Il, lo, la: Italian articles agree with the noun.");
  await form.getByLabel("Explanation status").selectOption("published");
  await form.getByLabel("YouTube video link").fill("not a link");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form.getByRole("status")).toHaveText("Not a valid YouTube link");
  await form.getByLabel("YouTube video link").fill("https://youtu.be/dQw4w9WgXcQ");
  await form.getByLabel("Video status").selectOption("approved");
  await form.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(`**/en/admin/topics/${topicId}`);

  const unitId = lessonId.replace(/-f-(.+)-\d+$/, "-fu-$1");
  await page.getByLabel("Attach this topic to every lesson of a unit").selectOption(unitId);
  await page.getByRole("button", { name: "Attach" }).click();
  await expect(page.getByTestId("linked-count")).toHaveText(/[1-9]\d* lessons linked/);

  await page.goto(`/en/learn/${lessonId}`);
  const panel = page.getByTestId("topic-panel");
  await expect(panel).toContainText("Articles");
  await expect(panel.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
});
