import { ReactScan } from "@/components/react-scan";
import React from "react";
import { Fira_Code, Monomaniac_One, Noto_Sans } from "next/font/google";
import { Metadata } from "next";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const monomaniacOne = Monomaniac_One({
  weight: "400",
  variable: "--font-monomaniac-one",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://7702.zerodev.app"),
  title: "7702 Examples - ZeroDev",
  description: "Explore practical examples of 7702 using ZeroDev and Embedded Wallets!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "7702 Examples - ZeroDev",
    description: "Explore practical examples of 7702 using ZeroDev and Embedded Wallets!",
    images: "/og-image.png",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <ReactScan />
      <body className={`${firaCode.variable} ${monomaniacOne.variable} ${notoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
