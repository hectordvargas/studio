
'use client';

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/layout";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="container mx-auto max-w-5xl flex justify-between items-center h-16 px-4">
              <Link href="/empleos" className="flex items-center gap-2">
                  <Logo className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/login">{t('publicPages.login')}</Link>
                </Button>
              </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
      </div>
  );
}
