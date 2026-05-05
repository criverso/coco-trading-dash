import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coco Trading Dash",
    short_name: "Coco Dash",
    description: "Cocoa market watch, order tickets, desk notes, and trading messages.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f8",
    theme_color: "#101314",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml"
      }
    ]
  };
}
