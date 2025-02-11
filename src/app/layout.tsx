import { Noto_Sans } from "next/font/google";

import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./layout.css";
import { AutoBackButton } from "@/ui/back-button";
import { Metadata } from "next";

// Page Metadata for SEO
export const metadata: Metadata = {
  title: "Computer Graphics 1 Practical Course - WT24",
  description:
    "Template for the Computer Graphics 1 Practical Course at the University of Mainz.",
};

// Font Configuration Import from Google Fonts
const Font = Noto_Sans({
  weight: ["400", "700", "900", "100"],
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

// Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>{/** Next adds most stuff automatically! */}</head>
      <body
        className={[
          Font.className,
          "relative m-0 h-[100dvh] min-h-[100dvh] w-[100dvw] min-w-[100dvw] overflow-hidden p-0"
        ].join(" ")}
      >
        {children}
        <AutoBackButton />
      </body>
    </html>
  );
}
