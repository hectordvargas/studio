
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { createContext, useCallback, useContext, useState } from 'react';

import es from '@/lib/locales/es.json';
import en from '@/lib/locales/en.json';
import { FirebaseClientProvider } from '@/firebase';

// --- Language Provider Setup ---
type Language = 'es' | 'en';
const translations = { es, en };

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
// --- End Language Provider Setup ---

// Since this is a client component, we can't export metadata directly.
// We can set it in a useEffect or handle it differently if needed,
// but for now, we'll keep it simple. We will remove the export.
//
// export const metadata: Metadata = {
//   title: 'AxusHire',
//   description: 'Portal de empleo impulsado por IA para análisis y clasificación de candidatos.',
// };

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>AxusHire</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
