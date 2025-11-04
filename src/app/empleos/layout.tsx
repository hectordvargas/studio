

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FirebaseClientProvider } from "@/firebase";
import Link from "next/link";
import es from '@/lib/locales/es.json';

export const defaultFooterContent = `
    <p>&copy; ${new Date().getFullYear()} ${es.publicPages.footer.line1.replace('{year}', new Date().getFullYear().toString())}</p>
    <p>${es.publicPages.footer.line2}</p>
    <div class="flex justify-center gap-x-2 flex-wrap">
      <span>${es.publicPages.footer.line3_1}</span>
      <span class="text-muted-foreground/50">|</span>
      <span>${es.publicPages.footer.line3_2}</span>
      <span class="text-muted-foreground/50">|</span>
      <span>${es.publicPages.footer.line3_3}</span>
    </div>
    <div class="flex justify-center gap-x-4">
      <a href="tel:+442038380707" class="hover:underline">${es.publicPages.footer.line4_1}</a>
      <span class="text-muted-foreground/50">|</span>
      <a href="mailto:support@altiaweb.co.uk" class="hover:underline">${es.publicPages.footer.line4_2}</a>
    </div>
`;


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="min-h-screen flex flex-col">
        <nav className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="container mx-auto max-w-5xl flex justify-between items-center h-16 px-4">
              <Link href="/empleos" className="flex items-center gap-2">
                  <Logo className="h-8 w-auto" />
              </Link>
              <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/login">{es.publicPages.login}</Link>
                </Button>
              </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </FirebaseClientProvider>
  );
}
