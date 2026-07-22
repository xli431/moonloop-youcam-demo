import type { CreateYouCamToolInput, ToolTask } from "../domain";

export interface YouCamToolProvider {
  createTask(input: CreateYouCamToolInput): Promise<ToolTask>;
  getTask(taskId: string): Promise<ToolTask | null>;
}
