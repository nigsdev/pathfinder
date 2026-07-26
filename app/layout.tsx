import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PathFinder — Honest college and career guidance",
  description:
    "Honest college and career guidance for Class 12 students and their parents — clear directions, a shortlist that fits you, and practical next steps.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B5BDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-canvas font-body text-body">
        <div className="mx-auto min-h-full w-full max-w-[640px] min-w-0 px-4">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
