import { z } from "zod";

export const GOALS = ["work", "travel", "study", "migration", "business", "interview", "daily", "academic"] as const;
export const SELF_LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"] as const;
export const DAILY_MINUTES = [5, 15, 30, 60] as const;
export const UI_LOCALES = ["ar", "en"] as const;

const langCode = z.string().regex(/^[a-z]{2,3}$/);

export const trackInput = z.object({
  targetLanguage: langCode,
  goal: z.enum(GOALS),
  dailyMinutes: z.coerce.number().int().refine((n): n is (typeof DAILY_MINUTES)[number] => (DAILY_MINUTES as readonly number[]).includes(n)),
  selfLevel: z.enum(SELF_LEVELS),
});
export type TrackInput = z.infer<typeof trackInput>;

export const onboardingInput = trackInput.extend({ nativeLanguage: langCode }).refine(
  (v) => v.nativeLanguage !== v.targetLanguage,
  { path: ["targetLanguage"], message: "same_language" },
);
export type OnboardingInput = z.infer<typeof onboardingInput>;

export const profileInput = z.object({
  name: z.string().trim().min(1).max(80),
  nativeLanguage: langCode,
  uiLocale: z.enum(UI_LOCALES),
});
export type ProfileInput = z.infer<typeof profileInput>;

export const signUpInput = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});
