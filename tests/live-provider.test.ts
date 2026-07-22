import { beforeEach, describe, expect, it, vi } from "vitest";
import { runtimeStore } from "../lib/runtime-store";
import { LiveYouCamBagProvider } from "../lib/youcam/live-provider";

const media = {
  fileName: "demo.jpg",
  contentType: "image/jpeg" as const,
  fileSize: 3,
  bytes: new Uint8Array([1, 2, 3]),
};

describe("LiveYouCamBagProvider", () => {
  beforeEach(() => runtimeStore.tasks.clear());

  it("registers, uploads, and creates a bag task without sending the token to presigned URLs", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({
        status: 200,
        data: {
          files: ["source", "reference"].map((id) => ({
            file_id: id,
            requests: [{ method: "PUT", url: `https://upload.example/${id}`, headers: { "Content-Type": "image/jpg" } }],
          })),
        },
      }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse({ status: 200, data: { task_id: "external-task" } }));

    const provider = new LiveYouCamBagProvider("secret-key", "https://api.example", fetcher);
    const task = await provider.createTask({
      productId: "eclipse-bag",
      experienceType: "apparel-vto",
      hasConsent: true,
      sourceMedia: media,
      referenceMedia: { ...media, fileName: "bag.jpg" },
    });

    expect(task.provider).toBe("youcam-live");
    expect(task.externalTaskId).toBe("external-task");
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({ Authorization: "Bearer secret-key" });
    expect(fetcher.mock.calls[1]?.[1]?.headers).not.toHaveProperty("Authorization");
    expect(fetcher.mock.calls[2]?.[1]?.headers).not.toHaveProperty("Authorization");
  });
});

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
