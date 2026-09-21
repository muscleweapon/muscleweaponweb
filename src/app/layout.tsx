import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Muscle Weapon® | Premium Sports Nutrition | Supplements That Empower',
    template: '%s | Muscle Weapon®',
  },
  description:
    'Elite performance supplements engineered for champions. Science-backed, lab-tested, and verified authentic with unique scratch-code anti-counterfeiting technology.',
  keywords: [
    'Muscle Weapon',
    'Supplements',
    'Protein',
    'Creatine',
    'Pre-workout',
    'Mass Gainer',
    'Multivitamins',
    'Sports Nutrition',
    'Scratch Code Verification',
    'Anti-Counterfeit',
    'India Sports Supplements',
  ],
  authors: [{ name: 'Muscle Weapon' }],
  creator: 'Muscle Weapon',
  publisher: 'Muscle Weapon',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Muscle Weapon',
    title: 'Muscle Weapon® | Premium Sports Nutrition',
    description:
      'Science-backed, lab-tested supplements with unique scratch-code anti-counterfeiting technology. Built for athletes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muscle Weapon® | Supplements That Empower',
    description:
      'Elite performance supplements engineered for champions. Verified authentic with scratch-code technology.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F8FC] text-[#0B1220] font-sans">
        {children}
      </body>
    </html>
  );
}

