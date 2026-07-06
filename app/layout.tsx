import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchNest",
  description: "A calmer way for parents to review what kids want to watch."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
