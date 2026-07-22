import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOONLOOP — Human-in-the-Loop Retail Intelligence",
  description:
    "A YouCam-powered retail experience that turns human-confirmed customer moments into explainable coaching episodes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
