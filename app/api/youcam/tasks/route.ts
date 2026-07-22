import { NextResponse } from "next/server";
import { createYouCamTaskSchema } from "@/lib/domain";
import type { CreateYouCamToolInput, RuntimeMedia } from "@/lib/domain";
import { getYouCamProvider } from "@/lib/youcam";

export async function POST(request: Request) {
  let input: CreateYouCamToolInput;
  try {
    input = await parseRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid task request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const parsed = createYouCamTaskSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const task = await getYouCamProvider().createTask({ ...parsed.data, ...input });
    return NextResponse.json(task, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

async function parseRequest(request: Request): Promise<CreateYouCamToolInput> {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return request.json() as Promise<CreateYouCamToolInput>;
  }

  const form = await request.formData();
  const source = form.get("sourceImage");
  const reference = form.get("referenceImage");
  if (!(source instanceof File) || !(reference instanceof File)) {
    throw new Error("Live mode requires sourceImage and referenceImage files");
  }
  if (form.get("hasConsent") !== "true") {
    throw new Error("Explicit consent is required");
  }

  return {
    productId: String(form.get("productId") ?? ""),
    experienceType: "apparel-vto",
    hasConsent: true,
    sourceMedia: await toRuntimeMedia(source),
    referenceMedia: await toRuntimeMedia(reference),
    gender: form.get("gender") === "male" ? "male" : "female",
    style: "random",
  };
}

async function toRuntimeMedia(file: File): Promise<RuntimeMedia> {
  const normalizedType = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (normalizedType !== "image/jpeg" && normalizedType !== "image/png" && normalizedType !== "image/heic") {
    throw new Error("Only JPEG, PNG, and HEIC images are supported");
  }
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
    throw new Error("Images must be larger than 0 bytes and no more than 10 MB");
  }
  return {
    fileName: file.name,
    contentType: normalizedType,
    fileSize: file.size,
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}
