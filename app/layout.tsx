import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommunityCoin — Mobilize Your Movement",
  description: "Turn online communities into coordinated action. Encrypted groups, liquid tokens, shared treasuries, and collective decision-making.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
