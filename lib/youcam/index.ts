import { MockYouCamProvider } from "./mock-provider";
import type { YouCamToolProvider } from "./provider";

export function getYouCamProvider(): YouCamToolProvider {
  const mode = process.env.YOUCAM_API_MODE ?? "mock";

  if (mode !== "mock") {
    throw new Error(
      "Live YouCam mode is not configured. Keep YOUCAM_API_MODE=mock until the product-specific endpoint mapping is implemented.",
    );
  }

  return new MockYouCamProvider();
}
