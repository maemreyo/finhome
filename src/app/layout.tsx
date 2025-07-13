import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Template",
  description: "A modern SaaS template built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}