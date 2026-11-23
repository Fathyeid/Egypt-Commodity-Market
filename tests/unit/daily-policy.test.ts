import {describe,it,expect} from "vitest";
import {chooseDailyLesson,dailyReviewLimit} from "@/lib/learner/daily-policy";
describe("daily lesson policy",()=>{
 it("repairs weak work before untouched material",()=>expect(chooseDailyLesson([{id:"new"},{id:"weak",score:40}])?.id).toBe("weak"));
 it("does not confuse zero with a completed result",()=>expect(chooseDailyLesson([{id:"zero",score:0},{id:"pass",score:70}])?.id).toBe("zero"));
 it("moves on only after 70 percent",()=>expect(chooseDailyLesson([{id:"done",score:70},{id:"next"}])?.id).toBe("next"));
 it("does not invent lessons after course completion",()=>expect(chooseDailyLesson([{id:"done",score:100}])).toBeNull());
 it("keeps daily reviews bounded",()=>{expect(dailyReviewLimit(5)).toBe(4);expect(dailyReviewLimit(15)).toBe(8);expect(dailyReviewLimit(45)).toBe(12);});
});
