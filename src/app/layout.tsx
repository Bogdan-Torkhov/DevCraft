import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevCraft — Developer & Designer Showcase Platform",
  description: "Share interactive code snippets, design mockups, and discover cutting-edge community creations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#08090e] text-[#f1f3f9] selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
