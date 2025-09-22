import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Blocktopia Wiki",
  description:
    "Blocktopia Wiki — the Roblox-style game where you can build, farm, trade, and explore in a 2.5D sandbox MMORPG. Find guides, tips, and items here!",
  keywords:
    "Blocktopia, Blocktopia Wiki, Roblox game wiki, sandbox MMORPG wiki, Blocktopia guides, Blocktopia tips, Blocktopia community, Blocktopia splicing, Blocktopia farmable, Blocktopia seeds, Blocktopia roblox",
  authors: [{ name: "Blocktopia Community" }],
  alternates: {
    canonical: "https://blocktopia-wiki.vercel.app/",
  },
  openGraph: {
    type: "website",
    url: "https://blocktopia-wiki.vercel.app/",
    title: "Blocktopia Wiki",
    description:
      "Blocktopia Wiki — a Roblox-style sandbox MMORPG where you can build, farm, trade, and explore. Discover guides, tips, and rare items to master the game!",
    images: [
      {
        url: "https://blocktopia-wiki.vercel.app/Blocktopia.webp",
        width: 1200,
        height: 630,
        alt: "Blocktopia Wiki — Roblox Tips & Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blocktopia Wiki",
    description:
      "Blocktopia Wiki — a Roblox-style game where you can build, farm, trade, and explore in a 2.5D sandbox MMORPG. Find guides, tips, and items here!",
    images: ["https://blocktopia-wiki.vercel.app/Blocktopia.webp"],
  },
  verification: {
    google: "_Kxi3cow_f_-qigMKk6DIaKtevp0f3n57mj7oZv8UXs",
    yandex: "220756db98c43f5b",
  },
  icons: {
    icon: [
      { url: "/logo-v1.webp", sizes: "32x32", type: "image/webp" },
      { url: "/logo-v1.webp", sizes: "16x16", type: "image/webp" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
             <Toaster position="top-center" />
      </body>
    </html>
  );
}
