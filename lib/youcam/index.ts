import { LiveYouCamBagProvider } from "./live-provider";
import { MockYouCamProvider } from "./mock-provider";
import type { YouCamToolProvider } from "./provider";

export function getYouCamProvider(): YouCamToolProvider {
  const mode = process.env.YOUCAM_API_MODE ?? "mock";

  if (mode === "mock") return new MockYouCamProvider();
  if (mode === "live") return new LiveYouCamBagProvider();
  throw new Error(`Unsupported YOUCAM_API_MODE: ${mode}`);
}
