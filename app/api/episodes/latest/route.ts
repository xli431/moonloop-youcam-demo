import { NextResponse } from "next/server";
import { toOperationalEpisodePayload } from "@/lib/data-boundary";
import { runtimeStore } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const episodes = Array.from(runtimeStore.episodes.values());
  const latest = episodes.at(-1);

  if (!latest) {
    return NextResponse.json({ episode: null }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    { episode: toOperationalEpisodePayload(latest) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
