import { expect, type Page } from "@playwright/test";

export const uniqueEmail = (tag: string) => `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`;
export const PASSWORD = "correct-horse-42";

export async function signUp(page: Page, lang: "ar" | "en", name: string, email: string) {
  await page.goto(`/${lang}/sign-up`);
  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(`**/${lang}/onboarding`);
}

/** Completes the wizard choosing native → target, goal, minutes, level. */
export async function onboard(page: Page, o: { native: string; target: string; goal: string; minutes: string; level: string }) {
  await expect(page.getByRole("progressbar")).toBeVisible();
  const next = page.getByTestId("wizard-next");
  await page.getByRole("button", { name: o.native, exact: false }).first().click();
  await next.click();
  await page.getByRole("button", { name: o.target, exact: false }).first().click();
  await next.click();
  await page.getByRole("button", { name: o.goal }).click();
  await next.click();
  await page.getByRole("button", { name: o.minutes }).click();
  await next.click();
  await page.getByRole("button", { name: o.level }).click();
  await next.click();
  await expect(page.locator("dl")).toBeVisible();
  await next.click();
  await page.waitForURL("**/dashboard");
}
