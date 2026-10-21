import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import { getTheme } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "wire",
  description: "A quiet desk for the feeds you keep.",
  keywords: ["news", "headlines", "rss", "wire"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${outfit.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
