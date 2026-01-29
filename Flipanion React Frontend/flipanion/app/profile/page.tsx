'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { supabase } from '../supabase-client';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/auth?mode=login');
        return;
      }

      setUser(currentUser as User);
      setName(currentUser.user_metadata?.name || '');
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/auth?mode=login');
      } else {
        setUser(session.user as User);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name },
      });

      if (error) {
        setMessage({ type: 'error', text: `Fehler: ${error.message}` });
      } else {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name,
          },
        });
        setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
        setEditing(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ein unerwarteter Fehler ist aufgetreten.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.user_metadata?.name || '');
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Profil wird geladen ...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Bitte melde dich an, um auf diese Seite zuzugreifen.</p>
            <Link href="/auth?mode=login" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              Zur Anmeldung →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Zurück zur Startseite
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mein Profil</h1>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900'
              }`}
            >
              <p
                className={
                  message.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-5xl">
                {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email-Adresse kann nicht geändert werden.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                placeholder="Gib deinen Namen ein"
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white transition-colors ${
                  editing
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                }`}
              />
            </div>

            {/* User ID (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Benutzer-ID
              </label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Bearbeiten
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Wird gespeichert ...' : 'Speichern'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
