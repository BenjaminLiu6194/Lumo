// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumo",
  description: "Multimodal Agentic AI Communication Tool for Nonverbal Users",
  icons: {
    icon: "/favicon.png", // Relative path from the public directory
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>
        <div className="relative min-h-screen w-full bg-white">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
