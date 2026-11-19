import { expect, test } from "@playwright/test";

test("RTL/LTR switch and theme toggle", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("link", { name: "English" }).click();
  await page.waitForURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const path of ["/ar", "/en", "/ar/sign-up", "/en/sign-in", "/ar/forgot-password"]) {
  test(`no horizontal scroll at phone width: ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("signed-in pages fit a phone screen (onboarding, dashboard, profile)", async ({ page }) => {
  const { signUp, onboard, uniqueEmail } = await import("./helpers");
  const noOverflow = async () =>
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await signUp(page, "ar", "منى", uniqueEmail("mobile"));
  await expect(page.getByRole("progressbar")).toBeVisible();
  await noOverflow();
  await onboard(page, { native: "العربية", target: "الإنجليزية", goal: "العمل", minutes: "30 دقيقة", level: "B1" });
  await noOverflow();
  await page.goto("/ar/profile");
  await expect(page.locator("#name")).toBeVisible();
  await noOverflow();
});
