import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

// One friendly humanist grotesk across all weights — Typeform's single-family
// discipline, warmer than a neutral geometric sans.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TypeForm — Forms people actually enjoy answering",
  description:
    "Build conversational forms and surveys that feel like a chat, not a chore. One question at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${hanken.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
