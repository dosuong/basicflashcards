import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cardify — English Flashcards",
  description: "Master your English vocabulary with beautiful, interactive flashcards. Track progress and learn efficiently.",
  keywords: "flashcards, english, vocabulary, learning, education",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Animated background orbs */}
        <div className="bgOrb bgOrb1" aria-hidden="true"></div>
        <div className="bgOrb bgOrb2" aria-hidden="true"></div>
        <div className="bgOrb bgOrb3" aria-hidden="true"></div>
        
        <Navbar />
        {children}
      </body>
    </html>
  );
}
