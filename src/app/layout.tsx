import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PS Track Dashboard",
  description: "미래 의사과학자 챌린지 트랙 학습 여정 대시보드",
  applicationName: "PS Track Dashboard",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[#f6f7f4] text-stone-950">{children}</body>
    </html>
  );
}
