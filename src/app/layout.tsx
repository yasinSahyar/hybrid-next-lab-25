// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getSession } from '@/lib/authActions';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shopping Stories',
  description: 'Share your shopping experiences and discover others!',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tokenContent = await getSession(); // request parametresi olmadan çağrılıyor
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="flex items-center justify-between flex-wrap bg-indigo-600 p-6">
          <div className="flex items-center flex-shrink-0 text-white mr-6">
            <span className="font-semibold text-xl tracking-tight">
              Shopping Stories
            </span>
          </div>
          <div className="lg:flex lg:items-center lg:w-auto justify-end">
            <ul className="flex">
              <li className="mr-4">
                <Link
                  href="/"
                  className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white"
                >
                  Home
                </Link>
              </li>
              {tokenContent && (
                <>
                  <li className="mr-4">
                    <Link
                      href="/profile"
                      className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white"
                    >
                      Profile
                    </Link>
                  </li>
                  <li className="mr-4">
                    <Link
                      href="/upload"
                      className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white"
                    >
                      Upload Story
                    </Link>
                  </li>
                </>
              )}
              <li className="mr-4">
                <Link
                  href="/login"
                  className="block mt-4 lg:inline-block lg:mt-0 text-indigo-200 hover:text-white"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="container mx-auto pt-4">{children}</div>
      </body>
    </html>
  );
}