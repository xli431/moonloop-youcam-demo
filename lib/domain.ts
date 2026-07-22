import { z } from "zod";

export const createYouCamTaskSchema = z.object({
  productId: z.string().min(1).max(80),
  experienceType: z.literal("apparel-vto"),
  hasConsent: z.literal(true),
});

export const createEpisodeSchema = z.object({
  taskId: z.string().min(1),
  productId: z.string().min(1).max(80),
  customerIntent: z.string().min(1).max(500),
  humanOutcome: z.enum(["confirmed", "adjustment"]),
  source: z.literal("youcam"),
});

export type CreateYouCamTaskInput = z.infer<typeof createYouCamTaskSchema>;
export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;

export type RuntimeMedia = {
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/heic";
  fileSize: number;
  bytes: Uint8Array;
};

export type CreateYouCamToolInput = CreateYouCamTaskInput & {
  sourceMedia?: RuntimeMedia;
  referenceMedia?: RuntimeMedia;
  gender?: "female" | "male";
  style?:
    | "random"
    | "style_parisian_chic"
    | "style_urban_chic"
    | "style_mediterranean_chic"
    | "style_art_deco_style";
};

export type ToolTask = {
  id: string;
  provider: "youcam-mock" | "youcam-live";
  productId: string;
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: number;
  externalTaskId?: string;
  result?: {
    previewTheme: string;
    notice: string;
    url?: string;
  };
};

export type EpisodePolicy = {
  trainingEligible: false;
  researchExportAllowed: false;
  evaluationExportAllowed: false;
  embeddingAllowed: false;
  worldModelEligible: false;
};

export type ExperienceEpisode = CreateEpisodeInput & {
  id: string;
  createdAt: string;
  score: number;
  policy: EpisodePolicy;
};
