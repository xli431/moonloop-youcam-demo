import type { ExperienceEpisode } from "./domain";

export const DATA_ORIGINS = [
  "first-party-catalog",
  "human-authored",
  "human-confirmed",
  "licensed-training-data",
  "consented-research-record",
  "youcam-input",
  "youcam-output",
  "youcam-derived",
  "youcam-assisted-episode",
] as const;

export const DATA_DESTINATIONS = [
  "youcam-runtime",
  "runtime-display",
  "operational-record",
  "operational-display",
  "gemini-text-inference",
  "gemini-vision",
  "training",
  "research-export",
  "evaluation-dataset",
  "embedding",
  "synthetic-data",
  "world-model",
] as const;

export type DataOrigin = (typeof DATA_ORIGINS)[number];
export type DataDestination = (typeof DATA_DESTINATIONS)[number];

export type ProvenancedValue<T> = Readonly<{
  origin: DataOrigin;
  value: T;
}>;

const ALLOWED_DESTINATIONS: Readonly<Record<DataOrigin, ReadonlySet<DataDestination>>> = {
  "first-party-catalog": new Set([
    "runtime-display",
    "operational-record",
    "operational-display",
    "gemini-text-inference",
  ]),
  "human-authored": new Set([
    "runtime-display",
    "operational-record",
    "operational-display",
    "gemini-text-inference",
  ]),
  "human-confirmed": new Set([
    "runtime-display",
    "operational-record",
    "operational-display",
    "gemini-text-inference",
  ]),
  "licensed-training-data": new Set([
    "training",
    "research-export",
    "evaluation-dataset",
    "embedding",
    "synthetic-data",
    "world-model",
  ]),
  "consented-research-record": new Set([
    "training",
    "research-export",
    "evaluation-dataset",
    "embedding",
    "synthetic-data",
    "world-model",
  ]),
  "youcam-input": new Set(["youcam-runtime"]),
  "youcam-output": new Set(["runtime-display"]),
  "youcam-derived": new Set(["runtime-display"]),
  "youcam-assisted-episode": new Set(["operational-record", "operational-display"]),
};

const RESTRICTED_FIELD_FRAGMENTS = [
  "apikey",
  "authorization",
  "embedding",
  "feature",
  "image",
  "media",
  "providerresponse",
  "resulturl",
  "token",
  "youcam",
] as const;

export class DataBoundaryError extends Error {
  constructor(origin: DataOrigin, destination: DataDestination) {
    super(`Data transfer blocked: ${origin} cannot enter ${destination}`);
    this.name = "DataBoundaryError";
  }
}

export function withProvenance<T>(value: T, origin: DataOrigin): ProvenancedValue<T> {
  return Object.freeze({ origin, value });
}

export function assertDataTransfer(origin: DataOrigin, destination: DataDestination): void {
  if (!ALLOWED_DESTINATIONS[origin].has(destination)) {
    throw new DataBoundaryError(origin, destination);
  }
}

export function assertPayloadHasNoRestrictedFields(payload: unknown): void {
  if (!payload || typeof payload !== "object") return;

  for (const [key, value] of Object.entries(payload)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (RESTRICTED_FIELD_FRAGMENTS.some((fragment) => normalizedKey.includes(fragment))) {
      throw new Error(`Restricted field blocked from safe payload: ${key}`);
    }
    assertPayloadHasNoRestrictedFields(value);
  }
}

export function createGeminiTextEnvelope(input: {
  customerIntent: ProvenancedValue<string>;
  locale: ProvenancedValue<string>;
  coachingGoal: ProvenancedValue<string>;
}) {
  for (const field of Object.values(input)) {
    assertDataTransfer(field.origin, "gemini-text-inference");
  }

  const payload = {
    customerIntent: input.customerIntent.value,
    locale: input.locale.value,
    coachingGoal: input.coachingGoal.value,
  };
  assertPayloadHasNoRestrictedFields(payload);
  return Object.freeze(payload);
}

export function toOperationalEpisodePayload(episode: ExperienceEpisode) {
  assertDataTransfer("youcam-assisted-episode", "operational-display");

  return Object.freeze({
    id: episode.id,
    productId: episode.productId,
    customerIntent: episode.customerIntent,
    humanOutcome: episode.humanOutcome,
    score: episode.score,
    createdAt: episode.createdAt,
    dataClassification: "restricted-youcam-assisted" as const,
    policy: episode.policy,
  });
}

export function assertEpisodeDestination(
  episode: Pick<ExperienceEpisode, "source">,
  destination: DataDestination,
): void {
  const origin: DataOrigin = episode.source === "youcam"
    ? "youcam-assisted-episode"
    : "human-confirmed";
  assertDataTransfer(origin, destination);
}
