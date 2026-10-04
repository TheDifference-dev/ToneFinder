import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToneFinder",
  description: "Yapay zekâ ile herhangi bir şarkının gitar tonunu kendi ekipmanına göre bul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
