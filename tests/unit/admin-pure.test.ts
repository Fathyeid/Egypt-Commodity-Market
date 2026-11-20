import { describe, expect, it } from "vitest";
import { isAdminEmail, parseYouTubeId } from "@/lib/admin";

describe("admin helpers", () => {
  it("recognises admins only from ADMIN_EMAILS (case-insensitive)", () => {
    const env = { ADMIN_EMAILS: " Boss@Example.com , second@example.com" };
    expect(isAdminEmail("boss@example.com", env)).toBe(true);
    expect(isAdminEmail("SECOND@example.com", env)).toBe(true);
    expect(isAdminEmail("other@example.com", env)).toBe(false);
    expect(isAdminEmail("boss@example.com", {})).toBe(false);
    expect(isAdminEmail(null, env)).toBe(false);
  });
  it("parses YouTube links and ids", () => {
    for (const u of [
      "dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
      "https://youtu.be/dQw4w9WgXcQ?si=x",
      "https://m.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    ]) expect(parseYouTubeId(u), u).toBe("dQw4w9WgXcQ");
    for (const u of ["", "not a link", "https://evil.example/watch?v=dQw4w9WgXcQ", "https://youtube.com/watch?v=short"]) expect(parseYouTubeId(u), u).toBeNull();
  });
});
