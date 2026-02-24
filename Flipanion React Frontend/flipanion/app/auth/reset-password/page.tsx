"use client";

import React from "react";
import { supabase } from "../../supabase-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [sessionReady, setSessionReady] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle Supabase PKCE flow: the recovery email redirects back with ?code=...
  // We must exchange that code for a session before we can call updateUser.
  React.useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      // PKCE flow — exchange the one-time code for a real session
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchError }) => {
        if (exchError) {
          setError("Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.");
        } else {
          setSessionReady(true);
          // Clean the code from the URL so a refresh doesn't try to reuse it
          window.history.replaceState({}, "", "/auth/reset-password");
        }
      });
      return;
    }

    // Implicit/legacy flow fallback — listen for PASSWORD_RECOVERY event from hash tokens
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // In case the event already fired before this effect ran
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // Password strength calculation
  React.useEffect(() => {
    if (newPassword.length > 0) {
      const hasNumber = /\d/.test(newPassword);
      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
      const isSequential =
        /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          newPassword,
        );
      const isRepeating = /(.)\1{2,}/.test(newPassword);
      const isCommon = [
        "password",
        "12345678",
        "qwertz",
        "asdfgh",
        "1234567",
      ].some((common) => newPassword.toLowerCase().includes(common));

      if (newPassword.length < 8 || isSequential || isRepeating || isCommon) {
        setPasswordStrength("weak");
      } else if (
        (newPassword.length >= 8 && hasNumber && hasLetter) ||
        (hasSpecial && hasLetter)
      ) {
        setPasswordStrength(hasSpecial && hasNumber ? "strong" : "medium");
      } else {
        setPasswordStrength("weak");
      }
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    if (passwordStrength === "weak") {
      setError("Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(`Fehler: ${updateError.message}`);
    } else {
      setMessage("Passwort erfolgreich geändert! Du wirst weitergeleitet ...");
      setTimeout(() => router.push("/"), 2000);
    }

    setLoading(false);
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-md w-full relative text-center">
          <div className="glass-card rounded-2xl p-8">
            {error ? (
              <>
                <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[var(--foreground)] font-semibold mb-2">Link ungültig oder abgelaufen</p>
                <p className="text-sm text-[var(--text-muted)] mb-6">{error}</p>
                <Link
                  href="/auth?mode=login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 text-sm"
                >
                  Neuen Link anfordern
                </Link>
              </>
            ) : (
              <>
                <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  Link wird überprüft ...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            Neues Passwort festlegen
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Gib dein neues Passwort ein
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-7 animate-fade-in-up-delay-1 shadow-xl shadow-indigo-500/5">
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Neues Passwort
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none pr-12"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-2.5">
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
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
                placeholder="••••••••"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">
                  Passwörter stimmen nicht überein
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1.5 text-xs text-green-500 font-medium">
                  Passwörter stimmen überein ✓
                </p>
              )}
            </div>

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
              disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Passwort wird geändert ...
                </>
              ) : (
                "Neues Passwort speichern"
              )}
            </button>
          </form>
        </div>

        {/* Back to login link */}
        <div className="mt-6 text-center animate-fade-in-up-delay-2">
          <Link
            href="/auth?mode=login"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
}
