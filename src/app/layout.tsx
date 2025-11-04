'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';
import AppLayout from './AppLayout'; // Adjusted import

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAppRoute = !['/'].includes(pathname);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>KogniSYNC</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {isAppRoute ? <AppLayout>{children}</AppLayout> : children}
        <Toaster />
      </body>
    </html>
  );
}
