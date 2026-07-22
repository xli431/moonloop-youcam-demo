import { NextResponse } from "next/server";
import { runtimeStore } from "@/lib/runtime-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const episodes = Array.from(runtimeStore.episodes.values());
  const latest = episodes.at(-1);

  if (!latest) {
    return NextResponse.json({ episode: null }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    {
      episode: {
        id: latest.id,
        productId: latest.productId,
        customerIntent: latest.customerIntent,
        humanOutcome: latest.humanOutcome,
        score: latest.score,
        createdAt: latest.createdAt,
        policy: latest.policy,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
