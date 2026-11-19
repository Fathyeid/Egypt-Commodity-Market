import { expect, test } from "@playwright/test";
import { onboard, signUp, uniqueEmail } from "./helpers";

test("profile: edit name, add/activate/delete tracks, switch interface language", async ({ page }) => {
  await signUp(page, "en", "Lina", uniqueEmail("profile"));
  await onboard(page, { native: "Arabic", target: "French", goal: "Study abroad", minutes: "15 min", level: "A1" });

  await page.goto("/en/profile");
  await page.locator("#name").fill("Lina K");
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page.getByRole("status").first()).toHaveText("Saved");

  await page.getByRole("button", { name: "Add a language" }).click();
  await page.getByLabel("Language", { exact: true }).selectOption("es");
  await page.locator("form").filter({ has: page.getByLabel("Language", { exact: true }) }).getByRole("button", { name: "Add a language" }).click();
  await expect(page.getByTestId("track-es").getByText("Active")).toBeVisible();
  await expect(page.getByTestId("track-fr").getByRole("button", { name: "Make active" })).toBeVisible();

  await page.getByTestId("track-fr").getByRole("button", { name: "Make active" }).click();
  await expect(page.getByTestId("track-fr").getByText("Active")).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await page.getByTestId("track-es").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByTestId("track-es")).toHaveCount(0);
  // Last track can't be deleted — no delete button is offered.
  await expect(page.getByTestId("track-fr").getByRole("button", { name: "Delete" })).toHaveCount(0);

  await page.getByLabel("Interface language").selectOption("ar");
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.waitForURL("**/ar/profile");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  await page.goto("/ar/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("أهلاً، Lina K");
});
