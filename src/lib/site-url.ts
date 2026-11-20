/**
 * Public base URL of the app. Explicit BETTER_AUTH_URL wins; on Vercel it is
 * derived automatically, so no manual step is needed after the first deploy.
 */
export function siteUrl(): string | undefined {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

/** Extra origins allowed to call auth (Vercel preview and branch URLs). */
export function extraTrustedOrigins(): string[] {
  return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((h): h is string => !!h)
    .map((h) => `https://${h}`);
}
