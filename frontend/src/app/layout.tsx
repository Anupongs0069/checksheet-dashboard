// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DarkModeProvider } from './components/DarkModeProvider';
import { AuthProvider } from '../contexts/AuthContext';
import AutoLogoutHandler from './ClientProviders';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "Record Online",
  description: "Save various data entries",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <DarkModeProvider>
            <AutoLogoutHandler />
            {children}
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}