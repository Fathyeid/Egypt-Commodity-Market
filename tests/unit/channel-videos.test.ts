import { describe, expect, it } from "vitest";
import { pickLessonVideo } from "@/lib/db/seed-topics";

const v = (n: number) => ({ videoId: `vid${String(n).padStart(8, "0")}`, title: `T${n}` });
const themes = { de: { food: [v(1), v(2), v(3)], mixed: [] } };

describe("lesson videos from channel catalogs", () => {
  it("gives neighbouring lessons different videos and ignores other ids", () => {
    expect(pickLessonVideo("de-a1-f-food-1", themes)?.title).toBe("T1");
    expect(pickLessonVideo("de-a1-f-food-2", themes)?.title).toBe("T2");
    expect(pickLessonVideo("de-a2-f-food-1", themes)?.title).not.toBe("T1"); // levels are offset
    expect(pickLessonVideo("de-a1-f-mixed-1", themes)).toBeNull();
    expect(pickLessonVideo("de-a1-u1-l1", themes)).toBeNull(); // hand-written lessons
    expect(pickLessonVideo("fr-a1-f-food-1", themes)).toBeNull();
  });
});
