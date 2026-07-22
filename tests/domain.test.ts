import { describe, expect, it } from "vitest";
import { createEpisodeSchema, createYouCamTaskSchema } from "../lib/domain";

describe("runtime input boundaries", () => {
  it("requires explicit consent before a visual task", () => {
    expect(
      createYouCamTaskSchema.safeParse({
        productId: "eclipse-bag",
        experienceType: "apparel-vto",
        hasConsent: false,
      }).success,
    ).toBe(false);
  });

  it("accepts only YouCam-sourced, human-confirmed episode outcomes", () => {
    expect(
      createEpisodeSchema.safeParse({
        taskId: "task-1",
        productId: "eclipse-bag",
        customerIntent: "A refined travel bag",
        humanOutcome: "confirmed",
        source: "youcam",
      }).success,
    ).toBe(true);
  });
});
