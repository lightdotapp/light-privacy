import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Light 2.0 - Building The Future Of Privacy On Solana",
  description: "Join the waitlist for Light 2.0. Building the future of privacy on Solana.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: "Light 2.0 - Building The Future Of Privacy On Solana",
    description: "Join the waitlist for Light 2.0. Building the future of privacy on Solana.",
    images: ['/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Light 2.0 - Building The Future Of Privacy On Solana",
    description: "Join the waitlist for Light 2.0. Building the future of privacy on Solana.",
    images: ['/logo.svg'],
  },
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
