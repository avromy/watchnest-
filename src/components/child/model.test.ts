import { describe, it, expect } from "vitest";
import { duration, serializeBookmark, waitForBookmarks } from "./model";
describe("raw duration labels", () => {
  it("formats positions without presenting watched percentages", () => {
    expect(duration(65)).toBe("1:05");
    expect(duration(0)).toBe("");
  });
});

describe("bookmark serialization across player lifecycles", () => {
  it("holds replay writes until delayed old position and ENDED cleanup finish", async () => {
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    let stored: number | null = null;
    const writes: string[] = [];
    const oldPosition = serializeBookmark(async () => {
      await delayed;
      stored = 45;
      writes.push("old position");
    });
    const oldEnded = serializeBookmark(async () => {
      stored = null;
      writes.push("old ENDED");
    });
    // A newly mounted player uses the same queue, rather than a new local queue.
    const freshRead = waitForBookmarks().then(() => {
      writes.push("fresh read");
      expect(stored).toBeNull();
    });
    const replay = serializeBookmark(async () => {
      stored = 2;
      writes.push("new replay");
    });
    await Promise.resolve();
    expect(writes).toEqual([]);
    release();
    await Promise.all([oldPosition, oldEnded, freshRead, replay]);
    expect(writes).toEqual([
      "old position",
      "old ENDED",
      "fresh read",
      "new replay",
    ]);
    expect(stored).toBe(2);
  });
  it("a failed old request does not strand writes from a later lifecycle", async () => {
    const failed = serializeBookmark(async () => {
      throw new Error("network failed");
    });
    const writes: string[] = [];
    const next = serializeBookmark(async () => {
      writes.push("next player");
    });
    await expect(failed).rejects.toThrow("network failed");
    await next;
    expect(writes).toEqual(["next player"]);
  });
});
