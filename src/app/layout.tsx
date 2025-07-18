import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinHome",
  description: "Vietnamese real estate financial planning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}