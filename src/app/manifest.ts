import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PS Track Dashboard",
    short_name: "PS Track",
    description: "미래 의사과학자 챌린지 트랙 학습 여정 대시보드",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f7f4",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/window.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/globe.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
