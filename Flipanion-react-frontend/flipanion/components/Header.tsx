'use client';

import React from 'react';
import { supabase } from '../app/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { GradientButton } from './ui/gradient-button';
import { ButtonHoldAndRelease } from './ui/hold-and-release-button';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export default function Header() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User | null);
      setAvatarUrl((user?.user_metadata as Record<string, string>)?.avatar_url ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
      setAvatarUrl((session?.user?.user_metadata as Record<string, string>)?.avatar_url ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
  };

  const links = [
    { label: 'Entdecken', href: '/browse' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Quiz erstellen', href: '/quiz/create' },
  ];

  return (
    <header
      className={cn(
        'sticky top-5 z-50',
        'mx-auto w-full max-w-4xl rounded-lg border border-[var(--border)] shadow',
        'bg-[var(--background)]/95 supports-[backdrop-filter]:bg-[var(--background)]/80 backdrop-blur-lg',
      )}
    >
      <nav className="mx-auto flex items-center justify-between p-1.5">
        {/* Logo */}
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-[var(--surface-hover)] duration-100"
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
            <Image src="/logo.png" alt="Flipanion" width={200} height={200} className="scale-[1.6]" />
          </div>
          <span className="text-base font-bold text-[var(--foreground)]">
            Flipanion
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                pathname === link.href &&
                  'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-[var(--border)] rounded-lg animate-pulse" />
            </div>
          ) : user ? (
            <>
              {/* Profile avatar (desktop) */}
              <Link
                href="/profile"
                className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a2e] shadow-sm overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-[10px]">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--foreground)] hidden xl:block">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'Nutzer'}
                </span>
              </Link>

              {/* Desktop logout */}
              <div className="hidden lg:block">
                <ButtonHoldAndRelease
                  holdDuration={1200}
                  onHoldComplete={handleLogout}
                  holdLabel="Abmelden"
                  releaseLabel="Loslassen"
                  className="min-w-28 h-8 text-xs"
                />
              </div>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login">
                <Button size="sm" variant="ghost">Anmelden</Button>
              </Link>
              <Link href="/auth?mode=signup" className="hidden lg:block">
                <GradientButton className="px-4 py-2 text-sm">
                  Registrieren
                </GradientButton>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden h-9 w-9 border-[var(--border)] cursor-pointer"
            >
              <MenuIcon className="size-4" />
            </Button>
            <SheetContent
              className="bg-[var(--background)]/95 supports-[backdrop-filter]:bg-[var(--background)]/80 gap-0 backdrop-blur-lg border-[var(--border)]"
              showClose={false}
              side="left"
            >
              {/* Mobile nav links */}
              <div className="grid gap-y-1 overflow-y-auto px-4 pt-12 pb-5">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: 'ghost', className: 'justify-start' }),
                      pathname === link.href &&
                        'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: 'ghost', className: 'justify-start' }),
                      pathname === '/profile' &&
                        'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
                    )}
                  >
                    Profil
                  </Link>
                )}
              </div>

              {/* Mobile footer actions */}
              <SheetFooter className="border-[var(--border)]">
                {user ? (
                  <ButtonHoldAndRelease
                    holdDuration={1200}
                    onHoldComplete={handleLogout}
                    holdLabel="Abmelden"
                    releaseLabel="Loslassen"
                    className="w-full"
                  />
                ) : (
                  <>
                    <Link href="/auth?mode=login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full border-[var(--border)]">
                        Anmelden
                      </Button>
                    </Link>
                    <Link href="/auth?mode=signup" onClick={() => setOpen(false)}>
                      <GradientButton className="w-full py-2.5 text-sm">
                        Registrieren
                      </GradientButton>
                    </Link>
                  </>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
