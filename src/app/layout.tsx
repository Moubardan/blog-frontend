import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Blog Full-Stack",
    template: "%s | Blog Full-Stack",
  },
  description:
    "Un blog SSR construit avec Next.js 14, Prisma et NextAuth. Articles sur le développement web full-stack.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
