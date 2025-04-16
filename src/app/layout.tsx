import type { Metadata } from "next";
import { Fira_Code, Monomaniac_One} from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "7702 Examples - ZeroDev",
  description: "Explore practical examples of 7702 using ZeroDev with Privy, Dynamic, Turnkey and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${firaCode.variable} ${monomaniacOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
