"use client";

import React, { Suspense } from "react";
import { supabase } from "../supabase-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-[var(--text-muted)]">Laden…</span></div>}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = React.useState(mode !== "signup");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [usernameAvailable, setUsernameAvailable] = React.useState<
    boolean | null
  >(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetCooldown, setResetCooldown] = React.useState(0);
  const router = useRouter();

  // Cooldown countdown timer
  React.useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  React.useEffect(() => {
    if (!isLogin && username.length >= 3 && !username.includes(" ")) {
      const timeoutId = setTimeout(async () => {
        setCheckingUsername(true);
        const candidate = username.trim();
        const { count, error } = await supabase
          .from("User")
          .select("name", { count: "exact", head: true })
          .eq("name", candidate);

        if (error) {
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable((count ?? 0) === 0);
        }
        setCheckingUsername(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, isLogin]);

  React.useEffect(() => {
    if (!isLogin && password.length > 0) {
      const hasNumber = /\d/.test(password);
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isSequential =
        /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          password,
        );
      const isRepeating = /(.)\1{2,}/.test(password);
      const isCommon = [
        "password",
        "12345678",
        "qwertz",
        "asdfgh",
        "1234567",
      ].some((common) => password.toLowerCase().includes(common));

      if (password.length < 8 || isSequential || isRepeating || isCommon) {
        setPasswordStrength("weak");
      } else if (
        (password.length >= 8 && hasNumber && hasLetter) ||
        (hasSpecial && hasLetter)
      ) {
        setPasswordStrength(hasSpecial && hasNumber ? "strong" : "medium");
      } else {
        setPasswordStrength("weak");
      }
    } else {
      setPasswordStrength(null);
    }
  }, [password, isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Login erfolgreich!");
      setTimeout(() => router.push("/"), 1000);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }
    setResetLoading(true);
    setError("");
    setMessage("");

    // Check if the email exists in the database before sending the reset email
    const { count, error: dbError } = await supabase
      .from("User")
      .select("email", { count: "exact", head: true })
      .eq("email", email);

    if (dbError) {
      setError("Fehler bei der Überprüfung. Bitte versuche es erneut.");
      setResetLoading(false);
      return;
    }

    if (!count || count === 0) {
      setError("Diese E-Mail-Adresse ist nicht registriert.");
      setResetLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts gesendet. Bitte prüfe dein Postfach.",
      );
      setResetCooldown(300); // 5 minutes = 300 seconds
    }
    setResetLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein!");
      setLoading(false);
      return;
    }

    if (passwordStrength === "weak") {
      setError("Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.");
      setLoading(false);
      return;
    }

    if (username.includes(" ")) {
      setError("Benutzername darf keine Leerzeichen enthalten.");
      setLoading(false);
      return;
    }

    if (!usernameAvailable) {
      setError(
        "Benutzername ist nicht verfügbar oder zu kurz (mindestens 3 Zeichen).",
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Konto erstellt! Bitte prüfe deine E-Mails zur Bestätigung.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary" style={{ top: '-15%', right: '-8%', width: '600px', height: '600px' }} />
        <div className="orb orb-accent" style={{ bottom: '-8%', left: '-8%', width: '500px', height: '500px' }} />
      </div>

      <div className="max-w-md w-full relative">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-3 justify-center group"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
              <Image src="/logo_flipanion.png" alt="Flipanion" width={200} height={200} className="scale-[1.6]" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)] tracking-[-0.02em]">
              Flipanion
            </span>
          </Link>
          <h2 className="mt-10 text-3xl font-bold text-[var(--foreground)] tracking-[-0.03em]">
            {isLogin ? "Willkommen zurück" : "Konto erstellen"}
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            {isLogin ? "Noch kein Konto? " : "Bereits ein Konto? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity"
            >
              {isLogin ? "Registrieren" : "Anmelden"}
            </button>
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card-static rounded-2xl p-8 animate-fade-in-up-delay-1">
          <form
            onSubmit={isLogin ? handleLogin : handleSignup}
            className="space-y-6"
          >
            {/* Username field (only for signup) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
                >
                  Benutzername
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required={!isLogin}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
                    placeholder="maxmustermann"
                    minLength={3}
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">
                      ✓
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                      ✗
                    </div>
                  )}
                </div>
                {username.includes(" ") && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Leerzeichen sind nicht erlaubt
                  </p>
                )}
                {!username.includes(" ") && usernameAvailable === false && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    Benutzername bereits vergeben
                  </p>
                )}
                {!username.includes(" ") && usernameAvailable === true && (
                  <p className="mt-1.5 text-xs text-green-500 font-medium">
                    Benutzername verfügbar ✓
                  </p>
                )}
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
                placeholder="du@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
                placeholder="••••••••"
                minLength={8}
              />
              {isLogin && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || resetCooldown > 0}
                    className={`text-xs font-medium transition-colors ${
                      resetCooldown > 0
                        ? "text-[var(--text-muted)] cursor-not-allowed"
                        : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {resetLoading
                      ? "Wird gesendet ..."
                      : resetCooldown > 0
                        ? `Erneut senden in ${Math.floor(resetCooldown / 60)}:${String(resetCooldown % 60).padStart(2, "0")}`
                        : "Passwort vergessen?"}
                  </button>
                </div>
              )}
              {!isLogin && passwordStrength && (
                <div className="mt-2.5">
                  {/* Password Strength Bar */}
                  <div className="flex gap-1.5">
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength === "weak"
                          ? "bg-red-500"
                          : passwordStrength === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength === "strong" ||
                        passwordStrength === "medium"
                          ? passwordStrength === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                          : "bg-[var(--border)]"
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength === "strong"
                          ? "bg-green-500"
                          : "bg-[var(--border)]"
                      }`}
                    />
                  </div>
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      passwordStrength === "weak"
                        ? "text-red-500"
                        : passwordStrength === "medium"
                          ? "text-amber-500"
                          : "text-green-500"
                    }`}
                  >
                    Passwortstärke:{" "}
                    {passwordStrength === "weak"
                      ? "Schwach"
                      : passwordStrength === "medium"
                        ? "Mittel"
                        : "Stark"}
                  </p>
                  {passwordStrength === "weak" && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Verwende min. 8 Zeichen mit Zahlen & Buchstaben. Vermeide
                      einfache Muster.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password field (only for signup) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
                >
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
                  placeholder="••••••••"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    Passwörter stimmen nicht überein
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1.5 text-xs text-green-500 font-medium">
                    Passwörter stimmen überein ✓
                  </p>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="border border-red-500/20 rounded-lg p-3.5 bg-red-500/5">
                <p className="text-sm text-red-400 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="border border-green-500/20 rounded-lg p-3.5 bg-green-500/5">
                <p className="text-sm text-green-400 font-medium">
                  {message}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || (!isLogin && username.includes(" "))}
              className="w-full py-2.5 px-4 bg-[var(--foreground)] text-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all duration-300 hover:opacity-90 active:scale-[0.98] flex items-center justify-center cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--background)]/30 border-t-[var(--background)] rounded-full animate-spin mr-2" />
                  {isLogin ? "Anmeldung ..." : "Konto wird erstellt ..."}
                </>
              ) : isLogin ? (
                "Anmelden"
              ) : (
                "Registrieren"
              )}
            </button>
          </form>
        </div>

        {/* Back to home link */}
        <div className="mt-6 text-center animate-fade-in-up-delay-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}