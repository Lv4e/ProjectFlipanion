'use client';

import React from 'react';
import { supabase } from '../supabase-client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = React.useState(mode !== 'signup');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<'weak' | 'medium' | 'strong' | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const router = useRouter();

  // Check username availability
  React.useEffect(() => {
    if (!isLogin && username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setCheckingUsername(true);
        
        // Check if username exists in User table
        const { data, error } = await supabase
          .from('User')
          .select('name')
          .eq('name', username)
          .single();
        
        setUsernameAvailable(error?.code === 'PGRST116'); // PGRST116 = no rows found
        setCheckingUsername(false);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, isLogin]);

  // Check password strength
  React.useEffect(() => {
    if (!isLogin && password.length > 0) {
      const hasNumber = /\d/.test(password);
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isSequential = /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
      const isRepeating = /(.)\1{2,}/.test(password);
      const isCommon = ['password', '12345678', 'qwertz', 'asdfgh', '1234567'].some(common => 
        password.toLowerCase().includes(common)
      );

      if (password.length < 8 || isSequential || isRepeating || isCommon) {
        setPasswordStrength('weak');
      } else if (password.length >= 8 && hasNumber && hasLetter || hasSpecial && hasLetter) {
        setPasswordStrength(hasSpecial && hasNumber ? 'strong' : 'medium');
      } else {
        setPasswordStrength('weak');
      }
    } else {
      setPasswordStrength(null);
    }
  }, [password, isLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Login erfolgreich!');
      // Redirect to home page after successful login
      setTimeout(() => router.push('/'), 1000);
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein!');
      setLoading(false);
      return;
    }

    if (passwordStrength === 'weak') {
      setError('Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.');
      setLoading(false);
      return;
    }

    if (!usernameAvailable) {
      setError('Benutzername ist nicht verfügbar oder zu kurz (mindestens 3 Zeichen).');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Konto erstellt! Bitte prüfe deine E-Mails zur Bestätigung.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700">
            Flipanion
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Noch kein Konto? ' : 'Bereits ein Konto? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Registrieren' : 'Anmelden'}
            </button>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {/* Username field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benutzername
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required={!isLogin}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="maxmustermann"
                    minLength={3}
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <div className="absolute right-3 top-3 text-green-600 text-xl">✓</div>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <div className="absolute right-3 top-3 text-red-600 text-xl">✗</div>
                  )}
                </div>
                {usernameAvailable === false && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Benutzername bereits vergeben
                  </p>
                )}
                {usernameAvailable === true && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Benutzername verfügbar
                  </p>
                )}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="du@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                minLength={8}
              />
              {!isLogin && passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  </div>
                  <p className={`mt-1 text-xs ${passwordStrength === 'weak' ? 'text-red-600 dark:text-red-400' : passwordStrength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                    Passwortstärke: {passwordStrength === 'weak' ? 'Schwach' : passwordStrength === 'medium' ? 'Mittel' : 'Stark'}
                  </p>
                  {passwordStrength === 'weak' && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Verwende mindestens 8 Zeichen mit Zahlen und Buchstaben. Vermeide einfache Muster.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passwort bestätigen
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Passwörter stimmen nicht überein
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Passwörter stimmen überein ✓
                  </p>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Anmeldung ...' : 'Konto wird erstellt ...'}
                </>
              ) : (
                isLogin ? 'Anmelden' : 'Registrieren'
              )}
            </button>
          </form>
        </div>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
