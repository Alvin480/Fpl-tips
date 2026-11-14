import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoutIQ | FPL Intelligence",
  description:
    "A personal Fantasy Premier League intelligence platform for smarter decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
