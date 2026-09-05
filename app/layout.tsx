import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXAMPLE — AI Visual Learning",
  description:
    "Turn any academic problem into an animated visual lesson. EXAMPLE teaches it step-by-step, quizzes you, and re-explains anything you miss — differently.",
  keywords: ["AI learning", "visual education", "interactive lessons", "adaptive learning"],
  openGraph: {
    title: "EXAMPLE — AI Visual Learning",
    description: "Turn any academic problem into an animated visual lesson powered by Gemini AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}>
        {children}
      </body>
    </html>
  );
}
