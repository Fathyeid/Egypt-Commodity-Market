import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { authSchema } from "@/lib/db/schema";
import { serviceStatus } from "@/lib/services";
import { sendMail } from "@/lib/email";
import { createHash } from "node:crypto";
import { extraTrustedOrigins, siteUrl } from "@/lib/site-url";

const services = serviceStatus();

/**
 * Session-signing secret. Set BETTER_AUTH_SECRET in production; if it's missing,
 * derive one from DATABASE_URL (itself a secret) so a fresh deploy still works.
 */
function authSecret(): string | undefined {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (!process.env.DATABASE_URL) return undefined;
  console.warn("BETTER_AUTH_SECRET is not set; deriving it from DATABASE_URL. Set it explicitly for production.");
  return createHash("sha256").update(`lisan-auth:${process.env.DATABASE_URL}`).digest("base64");
}

export const auth = betterAuth({
  baseURL: siteUrl(),
  secret: authSecret(),
  trustedOrigins: extraTrustedOrigins(),
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async sendResetPassword({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Lisan — reset your password / إعادة تعيين كلمة المرور",
        text: `Reset your password / لإعادة تعيين كلمة المرور:\n${url}\n\nThis link expires in 1 hour.`,
      });
    },
  },
  socialProviders: services.google
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          prompt: "select_account",
        },
      }
    : {},
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  // Brute-force protection. Only the E2E test server disables it (AUTH_RATE_LIMIT=off).
  rateLimit: { enabled: process.env.AUTH_RATE_LIMIT !== "off", window: 60, max: 30 },
  plugins: [nextCookies()],
});
