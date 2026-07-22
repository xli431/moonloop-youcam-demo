import type { ExperienceEpisode, ToolTask } from "./domain";

type RuntimeStore = {
  tasks: Map<string, ToolTask>;
  episodes: Map<string, ExperienceEpisode>;
};

const globalStore = globalThis as typeof globalThis & {
  __moonloopRuntimeStore?: RuntimeStore;
};

export const runtimeStore: RuntimeStore =
  globalStore.__moonloopRuntimeStore ?? {
    tasks: new Map<string, ToolTask>(),
    episodes: new Map<string, ExperienceEpisode>(),
  };

globalStore.__moonloopRuntimeStore = runtimeStore;
