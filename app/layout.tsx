import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment & Answer Mapping",
  description: "AI-powered Question Extraction and Answer Sheet Mapping",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistMono.variable} ${bricolage.className} h-full antialiased font-sans`}
    >
      <body className={`min-h-full flex flex-col font-sans ${bricolage.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
