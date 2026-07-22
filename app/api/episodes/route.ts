import { NextResponse } from "next/server";
import { createEpisodeSchema, type ExperienceEpisode } from "@/lib/domain";
import { applyYouCamPolicy } from "@/lib/policy";
import { runtimeStore } from "@/lib/runtime-store";

export async function POST(request: Request) {
  const parsed = createEpisodeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid episode", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const task = runtimeStore.tasks.get(parsed.data.taskId);
  if (!task || task.status !== "completed") {
    return NextResponse.json(
      { error: "Human confirmation requires a completed tool task" },
      { status: 409 },
    );
  }

  const score = parsed.data.humanOutcome === "confirmed" ? 90 : 72;
  const episode: ExperienceEpisode = applyYouCamPolicy({
    ...parsed.data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    score,
  });

  runtimeStore.episodes.set(episode.id, episode);
  return NextResponse.json(episode, { status: 201 });
}
