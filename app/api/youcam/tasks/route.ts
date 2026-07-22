import { NextResponse } from "next/server";
import { createYouCamTaskSchema } from "@/lib/domain";
import { getYouCamProvider } from "@/lib/youcam";

export async function POST(request: Request) {
  const parsed = createYouCamTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const task = await getYouCamProvider().createTask(parsed.data);
    return NextResponse.json(task, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
