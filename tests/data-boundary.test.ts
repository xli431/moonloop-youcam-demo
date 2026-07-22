import { describe, expect, it } from "vitest";
import {
  assertDataTransfer,
  assertEpisodeDestination,
  assertPayloadHasNoRestrictedFields,
  createGeminiTextEnvelope,
  DataBoundaryError,
  toOperationalEpisodePayload,
  withProvenance,
} from "../lib/data-boundary";
import { applyYouCamPolicy } from "../lib/policy";

const restrictedOrigins = [
  "youcam-input",
  "youcam-output",
  "youcam-derived",
  "youcam-assisted-episode",
] as const;

const modelDestinations = [
  "gemini-text-inference",
  "gemini-vision",
  "training",
  "research-export",
  "evaluation-dataset",
  "embedding",
  "synthetic-data",
  "world-model",
] as const;

describe("data boundary", () => {
  it("blocks every YouCam origin from model and dataset destinations", () => {
    for (const origin of restrictedOrigins) {
      for (const destination of modelDestinations) {
        expect(() => assertDataTransfer(origin, destination)).toThrow(DataBoundaryError);
      }
    }
  });

  it("allows a minimal Gemini text envelope from human and catalog fields", () => {
    const envelope = createGeminiTextEnvelope({
      customerIntent: withProvenance("A lightweight travel bag", "human-authored"),
      locale: withProvenance("en-US", "human-confirmed"),
      coachingGoal: withProvenance("Ask one clarifying question", "first-party-catalog"),
    });

    expect(envelope).toEqual({
      customerIntent: "A lightweight travel bag",
      locale: "en-US",
      coachingGoal: "Ask one clarifying question",
    });
  });

  it("rejects YouCam-assisted content from the Gemini text envelope", () => {
    expect(() => createGeminiTextEnvelope({
      customerIntent: withProvenance("Inferred from a try-on result", "youcam-derived"),
      locale: withProvenance("en-US", "human-confirmed"),
      coachingGoal: withProvenance("Recommend a product", "first-party-catalog"),
    })).toThrow(DataBoundaryError);
  });

  it("rejects restricted fields from otherwise safe payloads", () => {
    expect(() => assertPayloadHasNoRestrictedFields({ resultUrl: "https://example.test" }))
      .toThrow("Restricted field blocked");
    expect(() => assertPayloadHasNoRestrictedFields({ nested: { image_embedding: [1, 2] } }))
      .toThrow("Restricted field blocked");
  });

  it("projects only operational fields and blocks episode export", () => {
    const episode = applyYouCamPolicy({
      id: "episode-1",
      taskId: "task-secret",
      productId: "eclipse-bag",
      customerIntent: "A refined travel bag",
      humanOutcome: "confirmed" as const,
      source: "youcam" as const,
      createdAt: "2026-07-22T00:00:00.000Z",
      score: 90,
    });

    const payload = toOperationalEpisodePayload(episode);
    expect(payload).not.toHaveProperty("taskId");
    expect(payload).not.toHaveProperty("source");
    expect(payload.dataClassification).toBe("restricted-youcam-assisted");
    expect(() => assertEpisodeDestination(episode, "world-model")).toThrow(DataBoundaryError);
  });
});
