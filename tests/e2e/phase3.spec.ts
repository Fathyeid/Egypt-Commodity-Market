import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("AI tutor: test-mode banner, instant correction with explanation, memory on the dashboard", async ({ page }) => {
  await signUp(page, "en", "Tara", uniqueEmail("tutor"));
  await onboard(page, { native: "Arabic", target: "English", goal: "Work", minutes: "15 min", level: "A2" });

  await page.getByRole("link", { name: "Tutor" }).first().click();
  await page.waitForURL("**/en/tutor");
  await expect(page.getByTestId("ai-status")).toContainText("Test mode");
  await page.getByTestId("start-tutor-friendly").click();
  await page.waitForURL(/\/en\/tutor\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Friendly tutor");

  await page.getByRole("textbox", { name: "Type your message…" }).fill("Yesterday I has a big meeting");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("msg-assistant").last()).toContainText("[test]");
  const correction = page.getByTestId("correction");
  await expect(correction).toContainText("I has");
  await expect(correction).toContainText("I have");
  await expect(page.getByText("New words")).toBeVisible();

  // Reload: the conversation and its correction are persisted.
  await page.reload();
  await expect(page.getByTestId("correction")).toHaveCount(1);

  await page.goto("/en/dashboard");
  await expect(page.getByTestId("recurring-errors")).toContainText("have-has");
});

test("role-play: AI opens in character, learner replies, report with errors and better phrases", async ({ page }) => {
  await signUp(page, "ar", "مها", uniqueEmail("roleplay"));
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "السفر", minutes: "15 دقيقة", level: "A2" });

  await page.goto("/ar/tutor");
  await page.getByTestId("start-roleplay-hotel").click();
  await page.waitForURL(/\/ar\/tutor\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("الفندق");
  await expect(page.getByTestId("msg-assistant").first()).toContainText("reservation");

  await page.getByRole("textbox", { name: "اكتب رسالتك…" }).fill("Yes, I has a reservation for two nights");
  await page.getByRole("button", { name: "إرسال" }).click();
  await expect(page.getByTestId("msg-assistant")).toHaveCount(2);
  await expect(page.getByTestId("correction")).toHaveCount(0); // role-play doesn't interrupt with corrections

  await page.getByRole("button", { name: "إنهاء المحادثة وعرض التقرير" }).click();
  const report = page.getByTestId("roleplay-report");
  await expect(report).toBeVisible();
  await expect(report).toContainText("تقرير المحادثة");
  await expect(report).toContainText("I have");
  await expect(report).toContainText("I'd like to book a room");
  await expect(page.getByRole("textbox", { name: "اكتب رسالتك…" })).toHaveCount(0); // finished
});
