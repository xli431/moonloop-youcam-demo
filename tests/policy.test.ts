import { describe, expect, it } from "vitest";
import { applyYouCamPolicy, canEnterLearningPipeline } from "../lib/policy";

describe("YouCam episode policy", () => {
  it("blocks every learning and export destination", () => {
    const episode = applyYouCamPolicy({
      id: "episode-1",
      taskId: "task-1",
      productId: "eclipse-bag",
      customerIntent: "A versatile evening bag",
      humanOutcome: "confirmed" as const,
      source: "youcam" as const,
      createdAt: "2026-07-22T00:00:00.000Z",
      score: 90,
    });

    expect(episode.policy).toEqual({
      trainingEligible: false,
      researchExportAllowed: false,
      evaluationExportAllowed: false,
      embeddingAllowed: false,
      worldModelEligible: false,
    });
    expect(canEnterLearningPipeline(episode)).toBe(false);
    expect(Object.isFrozen(episode)).toBe(true);
    expect(Object.isFrozen(episode.policy)).toBe(true);
    expect(() => Object.assign(episode.policy, { trainingEligible: true })).toThrow();
  });
});
