import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PathFinder",
    short_name: "PathFinder",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#3B5BDB",
    icons: [
      {
        src: "/brand/appicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/appicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
