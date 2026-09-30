import { describe, it, expect } from "vitest";
import { playedSeconds } from "./model";
describe("credible child playback time", () => {
  it("counts forward playback capped by elapsed real time", () => {
    expect(playedSeconds(11.1, 10, 1, true, false)).toBe(1);
  });
  it("never counts forward or backward seeks", () => {
    expect(playedSeconds(250, 10, 1, true, false)).toBe(0);
    expect(playedSeconds(10, 250, 1, true, false)).toBe(0);
  });
  it("never counts paused, background, or suspended playback", () => {
    expect(playedSeconds(11, 10, 1, false, false)).toBe(0);
    expect(playedSeconds(11, 10, 1, true, true)).toBe(0);
    expect(playedSeconds(30, 10, 20, true, false)).toBe(0);
  });
  it("rejects malformed observations", () => {
    expect(playedSeconds(NaN, 10, 1, true, false)).toBe(0);
    expect(playedSeconds(11, 10, -1, true, false)).toBe(0);
  });
});
