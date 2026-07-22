import type { CreateYouCamToolInput, ToolTask } from "../domain";
import { runtimeStore } from "../runtime-store";
import type { YouCamToolProvider } from "./provider";

export class MockYouCamProvider implements YouCamToolProvider {
  async createTask(input: CreateYouCamToolInput): Promise<ToolTask> {
    const task: ToolTask = {
      id: crypto.randomUUID(),
      provider: "youcam-mock",
      productId: input.productId,
      status: "queued",
      createdAt: Date.now(),
    };

    runtimeStore.tasks.set(task.id, task);
    return task;
  }

  async getTask(taskId: string): Promise<ToolTask | null> {
    const task = runtimeStore.tasks.get(taskId);
    if (!task) return null;

    const elapsed = Date.now() - task.createdAt;
    const status = elapsed >= 1200 ? "completed" : elapsed >= 450 ? "processing" : "queued";
    const nextTask: ToolTask = {
      ...task,
      status,
      result:
        status === "completed"
          ? {
              previewTheme: task.productId,
              notice: "Synthetic interface preview. No image was uploaded or retained.",
            }
          : undefined,
    };

    runtimeStore.tasks.set(task.id, nextTask);
    return nextTask;
  }
}
