import { z } from "zod";
import type { CreateYouCamToolInput, RuntimeMedia, ToolTask } from "../domain";
import { runtimeStore } from "../runtime-store";
import type { YouCamToolProvider } from "./provider";

const fileResponseSchema = z.object({
  status: z.number(),
  data: z.object({
    files: z.array(
      z.object({
        file_id: z.string(),
        requests: z.array(
          z.object({
            method: z.literal("PUT"),
            url: z.string().url(),
            headers: z.record(z.string(), z.string()),
          }),
        ),
      }),
    ),
  }),
});

const createTaskResponseSchema = z.object({
  status: z.number(),
  data: z.object({ task_id: z.string() }),
});

const taskResponseSchema = z.object({
  status: z.number(),
  data: z.object({
    error: z.unknown().nullable().optional(),
    results: z.object({ url: z.string().url() }).optional(),
    task_status: z.string(),
  }),
});

const allowedMediaTypes = new Set(["image/jpeg", "image/png", "image/heic"]);
const maximumFileSize = 10 * 1024 * 1024;

export class LiveYouCamBagProvider implements YouCamToolProvider {
  constructor(
    private readonly apiKey = process.env.YOUCAM_API_TOKEN,
    private readonly baseUrl = process.env.YOUCAM_API_BASE_URL ??
      "https://yce-api-01.makeupar.com",
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async createTask(input: CreateYouCamToolInput): Promise<ToolTask> {
    if (!this.apiKey) throw new Error("YOUCAM_API_TOKEN is not configured");
    if (!input.sourceMedia || !input.referenceMedia) {
      throw new Error("Live bag try-on requires a customer image and a bag reference image");
    }

    this.validateMedia(input.sourceMedia);
    this.validateMedia(input.referenceMedia);

    const registered = await this.registerFiles([input.sourceMedia, input.referenceMedia]);
    await Promise.all([
      this.uploadFile(registered[0], input.sourceMedia),
      this.uploadFile(registered[1], input.referenceMedia),
    ]);

    const response = await this.fetcher(`${this.baseUrl}/s2s/v2.0/task/bag`, {
      method: "POST",
      headers: this.authorizedHeaders(),
      body: JSON.stringify({
        src_file_id: registered[0].file_id,
        ref_file_id: registered[1].file_id,
        gender: input.gender ?? "female",
        style: input.style ?? "random",
      }),
    });

    if (!response.ok) throw new Error(`YouCam task creation failed with status ${response.status}`);
    const payload = createTaskResponseSchema.parse(await response.json());
    const task: ToolTask = {
      id: crypto.randomUUID(),
      externalTaskId: payload.data.task_id,
      provider: "youcam-live",
      productId: input.productId,
      status: "queued",
      createdAt: Date.now(),
    };
    runtimeStore.tasks.set(task.id, task);
    return task;
  }

  async getTask(taskId: string): Promise<ToolTask | null> {
    const task = runtimeStore.tasks.get(taskId);
    if (!task || task.provider !== "youcam-live" || !task.externalTaskId) return null;
    if (!this.apiKey) throw new Error("YOUCAM_API_TOKEN is not configured");

    const response = await this.fetcher(
      `${this.baseUrl}/s2s/v2.0/task/bag/${encodeURIComponent(task.externalTaskId)}`,
      { headers: this.authorizedHeaders() },
    );
    if (!response.ok) throw new Error(`YouCam task polling failed with status ${response.status}`);

    const payload = taskResponseSchema.parse(await response.json());
    const status = this.mapStatus(payload.data.task_status);
    const nextTask: ToolTask = {
      ...task,
      status,
      result:
        status === "completed" && payload.data.results
          ? {
              previewTheme: task.productId,
              notice: "Temporary YouCam runtime result. It is excluded from learning pipelines.",
              url: payload.data.results.url,
            }
          : undefined,
    };
    runtimeStore.tasks.set(task.id, nextTask);
    return nextTask;
  }

  private async registerFiles(media: RuntimeMedia[]) {
    const response = await this.fetcher(`${this.baseUrl}/s2s/v2.0/file/bag`, {
      method: "POST",
      headers: this.authorizedHeaders(),
      body: JSON.stringify({
        files: media.map((item) => ({
          content_type: item.contentType === "image/jpeg" ? "image/jpg" : item.contentType,
          file_name: item.fileName,
          file_size: item.fileSize,
        })),
      }),
    });
    if (!response.ok) throw new Error(`YouCam file registration failed with status ${response.status}`);
    const payload = fileResponseSchema.parse(await response.json());
    if (payload.data.files.length !== media.length) {
      throw new Error("YouCam file registration returned an unexpected file count");
    }
    return payload.data.files;
  }

  private async uploadFile(
    registration: z.infer<typeof fileResponseSchema>["data"]["files"][number],
    media: RuntimeMedia,
  ) {
    const upload = registration.requests[0];
    if (!upload) throw new Error("YouCam file registration did not return an upload request");
    const uploadBytes = new Uint8Array(media.bytes.byteLength);
    uploadBytes.set(media.bytes);
    const response = await this.fetcher(upload.url, {
      method: "PUT",
      headers: upload.headers,
      body: new Blob([uploadBytes.buffer], { type: media.contentType }),
    });
    if (!response.ok) throw new Error(`YouCam media upload failed with status ${response.status}`);
  }

  private validateMedia(media: RuntimeMedia) {
    if (!allowedMediaTypes.has(media.contentType)) throw new Error("Unsupported image type");
    if (media.fileSize <= 0 || media.fileSize > maximumFileSize) {
      throw new Error("Image must be larger than 0 bytes and no more than 10 MB");
    }
  }

  private authorizedHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private mapStatus(status: string): ToolTask["status"] {
    if (status === "success") return "completed";
    if (status === "error") return "failed";
    return "processing";
  }
}
