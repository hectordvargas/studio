'use client';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PublicNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container flex h-14 items-center">
        <Link href="/empleos" className="flex items-center gap-2">
          <Logo className="h-7 w-auto text-primary" />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button asChild>
              <Link href="/">Iniciar Sesión</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-card">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} KogniSYNC. Todos los derechos reservados.</p>
        <p className="mt-2 text-xs">
          Una solución de Altiaweb Ltd.
        </p>
      </div>
    </footer>
  );
}


export default function EmpleosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
