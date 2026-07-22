import { NextResponse } from "next/server";
import { getYouCamProvider } from "@/lib/youcam";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let task;
  try {
    task = await getYouCamProvider().getTask(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
