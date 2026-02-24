"use client";

import React from "react";
import { supabase } from "../supabase-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
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
    if (!isLogin && username.length >= 3) {
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
      setMessage("Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts gesendet. Bitte prüfe dein Postfach.");
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

    if (username.includes(' ')) {
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
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 justify-center group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-500/25 transition-shadow">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Flipanion
            </span>
          </Link>
          <h2 className="mt-8 text-3xl font-bold text-[var(--foreground)] tracking-tight">
            {isLogin ? "Willkommen zurück" : "Konto erstellen"}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {isLogin ? "Noch kein Konto? " : "Bereits ein Konto? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? "Registrieren" : "Anmelden"}
            </button>
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-7 animate-fade-in-up-delay-1 shadow-xl shadow-indigo-500/5">
          <form
            onSubmit={isLogin ? handleLogin : handleSignup}
            className="space-y-5"
          >
            {/* Username field (only for signup) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-[var(--foreground)] mb-2"
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
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
                    placeholder="maxmustermann"
                    minLength={3}
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
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
                {usernameAvailable === false && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    Benutzername bereits vergeben
                  </p>
                )}
                {usernameAvailable === true && (
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
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
                placeholder="du@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
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
                        : "text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                        passwordStrength === "strong" || passwordStrength === "medium"
                          ? passwordStrength === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                          : "bg-[var(--border)]"
                      }`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        passwordStrength === "strong" ? "bg-green-500" : "bg-[var(--border)]"
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
                      Verwende min. 8 Zeichen mit Zahlen & Buchstaben. Vermeide einfache Muster.
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
                  className="block text-sm font-semibold text-[var(--foreground)] mb-2"
                >
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
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
              <div className="glass-card border border-red-200 dark:border-red-500/20 rounded-xl p-3.5 bg-red-50/50 dark:bg-red-500/8">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="glass-card border border-green-200 dark:border-green-500/20 rounded-xl p-3.5 bg-green-50/50 dark:bg-green-500/8">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {message}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || (!isLogin && username.includes(' '))}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
