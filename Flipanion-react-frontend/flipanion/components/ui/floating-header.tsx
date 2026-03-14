'use client';

import React from 'react';
import {
	MenuIcon,
	MoonIcon,
	SunIcon,
	LogOutIcon,
	CompassIcon,
	TrophyIcon,
	PlusCircleIcon,
	UserIcon,
	XIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/app/supabase-client';

interface User {
	id: string;
	email: string;
	user_metadata: {
		name?: string;
		avatar_url?: string;
	};
}

export function FloatingHeader() {
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
	const router = useRouter();
	const pathname = usePathname();

	// Auth state
	React.useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user as User | null);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user as User | null);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Theme detection
	React.useEffect(() => {
		const root = document.documentElement;
		setTheme(root.classList.contains('dark') ? 'dark' : 'light');
	}, []);

	const applyTheme = (nextTheme: 'light' | 'dark') => {
		const html = document.documentElement;
		if (nextTheme === 'dark') {
			html.classList.add('dark');
			html.classList.remove('light');
			html.style.colorScheme = 'dark';
		} else {
			html.classList.remove('dark');
			html.classList.add('light');
			html.style.colorScheme = 'light';
		}
		localStorage.setItem('theme', nextTheme);
		setTheme(nextTheme);
	};

	const toggleTheme = () => {
		applyTheme(theme === 'light' ? 'dark' : 'light');
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setMobileOpen(false);
		router.push('/');
	};

	const navLinks = [
		{ label: 'Entdecken', href: '/browse', icon: CompassIcon },
		{ label: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
		{ label: 'Quiz erstellen', href: '/quiz/create', icon: PlusCircleIcon },
	];

	const avatarUrl = user?.user_metadata?.avatar_url ?? null;
	const displayName =
		user?.user_metadata?.name || user?.email?.split('@')[0] || 'Nutzer';

	return (
		<>
			<header
				className="sticky top-4 z-50 mx-auto w-full max-w-4xl px-4"
			>
				<div
					className="rounded-2xl border border-[var(--border-strong)] shadow-[var(--shadow-soft)]"
					style={{
						background: 'color-mix(in srgb, var(--surface) 65%, transparent)',
						backdropFilter: 'blur(20px) saturate(130%)',
						WebkitBackdropFilter: 'blur(20px) saturate(130%)',
					}}
				>
					<nav className="flex items-center justify-between px-4 py-2.5">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center gap-2.5 group"
						>
							<div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
								<Image
									src="/flipanion_logo.png"
									alt="Flipanion"
									width={32}
									height={32}
									className="scale-[1.6]"
								/>
							</div>
							<span className="text-[0.95rem] font-bold text-[var(--foreground)] tracking-[-0.03em] opacity-90 group-hover:opacity-100 transition-opacity duration-300">
								Flipanion
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden items-center gap-1 lg:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 inline-block hover-underline ${
										pathname === link.href
											? 'text-[var(--foreground)]'
											: 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
									}`}
									href={link.href}
								>
									{link.label}
								</Link>
							))}
						</div>

						{/* Right side actions */}
						<div className="flex items-center gap-1">
							{/* Theme toggle */}
							<button
								onClick={toggleTheme}
								aria-label={
									theme === 'light'
										? 'Dark Mode aktivieren'
										: 'Light Mode aktivieren'
								}
								className="relative h-9 w-9 rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all duration-300"
								type="button"
							>
								{theme === 'light' ? (
									<MoonIcon className="w-[18px] h-[18px]" />
								) : (
									<SunIcon className="w-[18px] h-[18px]" />
								)}
							</button>

							{/* Auth buttons */}
							{loading ? (
								<div className="h-9 w-20 bg-[var(--surface-hover)] rounded-xl animate-pulse" />
							) : user ? (
								<div className="hidden items-center gap-1 lg:flex">
									<div className="w-px h-5 bg-[var(--border)] mx-1.5" />
									{/* Profile link */}
									<Link
										href="/profile"
										className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300 group ${
											pathname === '/profile'
												? 'text-[var(--foreground)]'
												: 'text-[var(--text-muted)]'
										}`}
									>
										<div className="w-6 h-6 bg-[var(--primary)] rounded-lg flex items-center justify-center overflow-hidden opacity-80 group-hover:opacity-100 transition-all duration-300">
											{avatarUrl ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={avatarUrl}
													alt=""
													className="w-full h-full object-cover"
												/>
											) : (
												<span className="text-white font-semibold text-[10px]">
													{displayName.charAt(0).toUpperCase()}
												</span>
											)}
										</div>
										<span className="text-sm font-medium group-hover:text-[var(--foreground)] hidden sm:block transition-colors duration-300 max-w-[100px] truncate">
											{displayName}
										</span>
									</Link>
									{/* Logout */}
									<button
										onClick={handleLogout}
										className="px-2 py-1.5 text-[var(--text-muted)] hover:text-red-400 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300"
										aria-label="Abmelden"
										type="button"
									>
										<LogOutIcon className="w-[18px] h-[18px]" />
									</button>
								</div>
							) : (
								<div className="hidden items-center gap-1.5 lg:flex ml-1.5">
									<Link href="/auth?mode=login">
										<button className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-xl transition-all duration-300" type="button">
											Anmelden
										</button>
									</Link>
									<Link href="/auth?mode=signup">
										<button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-xl hover:bg-[var(--border)] transition-all duration-300" type="button">
											Registrieren
										</button>
									</Link>
								</div>
							)}

							{/* Mobile menu button */}
							<button
								onClick={() => setMobileOpen(!mobileOpen)}
								className="h-9 w-9 rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all duration-300 lg:hidden border border-[var(--border-strong)]"
								type="button"
								aria-label="Menü öffnen"
							>
								<MenuIcon className="w-[18px] h-[18px]" />
							</button>
						</div>
					</nav>
				</div>
			</header>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			{/* Mobile slide-out menu */}
			<div
				className={`fixed inset-y-0 left-0 z-[70] w-3/4 max-w-sm flex flex-col shadow-[var(--shadow-large)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
					mobileOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
				style={{
					background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
					backdropFilter: 'blur(20px)',
					WebkitBackdropFilter: 'blur(20px)',
					borderRight: '1px solid var(--border)',
				}}
			>
				{/* Close button */}
				<button
					onClick={() => setMobileOpen(false)}
					className="absolute top-4 right-4 h-8 w-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all duration-300"
					type="button"
					aria-label="Menü schließen"
				>
					<XIcon className="w-4 h-4" />
				</button>

				{/* Mobile nav links */}
				<div className="flex-1 overflow-y-auto px-5 pt-14 pb-5 space-y-1">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
								pathname === link.href
									? 'text-[var(--foreground)] bg-[var(--surface-hover)]'
									: 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
							}`}
							href={link.href}
							onClick={() => setMobileOpen(false)}
						>
							<link.icon className="w-4 h-4" />
							{link.label}
						</Link>
					))}
					{user && (
						<Link
							className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
								pathname === '/profile'
									? 'text-[var(--foreground)] bg-[var(--surface-hover)]'
									: 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
							}`}
							href="/profile"
							onClick={() => setMobileOpen(false)}
						>
							<UserIcon className="w-4 h-4" />
							Profil
						</Link>
					)}
				</div>

				{/* Mobile footer actions */}
				<div className="mt-auto p-5 border-t border-[var(--border)] space-y-3" style={{ background: 'color-mix(in srgb, var(--surface) 30%, transparent)' }}>
					{user ? (
						<>
							<div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
								{avatarUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={avatarUrl}
										alt=""
										className="h-6 w-6 rounded-full object-cover"
									/>
								) : (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-white">
										{displayName.charAt(0).toUpperCase()}
									</div>
								)}
								<span className="truncate">{displayName}</span>
							</div>
							<button
								onClick={handleLogout}
								className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-red-400 border border-[var(--border-strong)] rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300"
								type="button"
							>
								<LogOutIcon className="w-4 h-4" />
								Abmelden
							</button>
						</>
					) : (
						<>
							<Link
								href="/auth?mode=login"
								onClick={() => setMobileOpen(false)}
							>
								<button className="w-full px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300" type="button">
									Anmelden
								</button>
							</Link>
							<Link
								href="/auth?mode=signup"
								onClick={() => setMobileOpen(false)}
							>
								<button className="w-full px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] rounded-xl hover:opacity-90 transition-all duration-300" type="button">
									Registrieren
								</button>
							</Link>
						</>
					)}
				</div>
			</div>
		</>
	);
}
