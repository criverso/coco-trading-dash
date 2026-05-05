import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Player 2",
    short_name: "Player 2",
    description: "Safety-first meetup matching, clubs, chat, and social play.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#11261e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml"
      }
    ]
  };
}

