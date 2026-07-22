import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MOONLOOP",
    short_name: "MOONLOOP",
    description: "Human-in-the-loop retail intelligence for web and wearable displays.",
    start_url: "/",
    display: "standalone",
    background_color: "#100b12",
    theme_color: "#2b1725",
    orientation: "landscape",
  };
}
