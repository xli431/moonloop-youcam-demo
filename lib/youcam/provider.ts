import type { CreateYouCamTaskInput, ToolTask } from "../domain";

export interface YouCamToolProvider {
  createTask(input: CreateYouCamTaskInput): Promise<ToolTask>;
  getTask(taskId: string): Promise<ToolTask | null>;
}
