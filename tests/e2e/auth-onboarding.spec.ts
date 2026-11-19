import { expect, test } from "@playwright/test";
import { onboard, PASSWORD, signUp, uniqueEmail } from "./helpers";

test("protected pages redirect to sign-in", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/sign-in\?next=%2Fen%2Fdashboard/);
});

test("sign up → onboarding → dashboard; data persists across a fresh device session", async ({ page, browser }) => {
  const email = uniqueEmail("flow");
  await signUp(page, "ar", "سارة", email);
  await onboard(page, { native: "العربية", target: "الألمانية", goal: "السفر", minutes: "15 دقيقة", level: "A2" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("أهلاً، سارة");
  await expect(page.getByText("تتعلم الألمانية · هدفك: السفر")).toBeVisible();
  // Real numbers from an empty account — zeros, plus an honest empty-state note.
  await expect(page.getByText("لا يوجد نشاط مسجّل بعد")).toBeVisible();
  await expect(page.getByText("تقدير ذاتي، سيؤكده الاختبار")).toBeVisible();
  await expect(page.getByText("المدرس الذكي: غير مفعّل")).toBeVisible();

  // "Another device": brand-new browser context, sign in with the same account.
  const ctx = await browser.newContext();
  const other = await ctx.newPage();
  await other.goto("/en/sign-in");
  await other.locator("#email").fill(email);
  await other.locator("#password").fill(PASSWORD);
  await other.locator('form button[type="submit"]').click();
  await other.waitForURL("**/en/dashboard");
  await expect(other.getByText("Learning German · Goal: Travel")).toBeVisible();
  await ctx.close();
});

test("sign out, wrong password message, and sign back in", async ({ page }) => {
  const email = uniqueEmail("signout");
  await signUp(page, "en", "Omar", email);
  await onboard(page, { native: "Arabic", target: "English", goal: "Work", minutes: "30 min", level: "B1" });
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/en$/);
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/sign-in/);

  await page.locator("#email").fill(email);
  await page.locator("#password").fill("wrong-password");
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator("form [role=alert]")).toHaveText("Incorrect email or password.");

  await page.locator("#password").fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL("**/en/dashboard");
  await expect(page.getByText("Learning English · Goal: Work")).toBeVisible();
});

test("duplicate email is rejected and Google shows a not-configured state", async ({ page }) => {
  const email = uniqueEmail("dup");
  await signUp(page, "en", "First", email);
  await page.context().clearCookies();
  await page.goto("/en/sign-up");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  await expect(page.getByText("Google sign-in is not configured yet")).toBeVisible();
  await page.locator("#name").fill("Second");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator("form [role=alert]")).toHaveText("An account with this email already exists.");
});
