import type { EpisodePolicy, ExperienceEpisode } from "./domain";

export const YOUCAM_RESTRICTED_POLICY: EpisodePolicy = Object.freeze({
  trainingEligible: false,
  researchExportAllowed: false,
  evaluationExportAllowed: false,
  embeddingAllowed: false,
  worldModelEligible: false,
});

export function applyYouCamPolicy<T extends Omit<ExperienceEpisode, "policy">>(
  episode: T,
): T & { policy: EpisodePolicy } {
  return {
    ...episode,
    policy: { ...YOUCAM_RESTRICTED_POLICY },
  };
}

export function canEnterLearningPipeline(episode: Pick<ExperienceEpisode, "policy">): boolean {
  return (
    episode.policy.trainingEligible &&
    episode.policy.researchExportAllowed &&
    episode.policy.evaluationExportAllowed &&
    episode.policy.embeddingAllowed &&
    episode.policy.worldModelEligible
  );
}
