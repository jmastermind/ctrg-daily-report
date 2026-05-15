import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CTRG Dnevni Izvještaj",
  description: "Color Trgovina - Sustav za dnevne izvještaje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
