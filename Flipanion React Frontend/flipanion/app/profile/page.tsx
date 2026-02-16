"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { supabase } from "../supabase-client";

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
  created_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingUsername, setEditingUsername] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [originalUsername, setOriginalUsername] = React.useState("");
  const [usernameAvailable, setUsernameAvailable] = React.useState<
    boolean | null
  >(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/auth?mode=login");
        return;
      }

      setUser(currentUser as User);
      const currentName = currentUser.user_metadata?.name || "";
      setUsername(currentName);
      setOriginalUsername(currentName);
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth?mode=login");
      } else {
        setUser(session.user as User);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Check username availability with debounce
  React.useEffect(() => {
    // Skip check if username hasn't changed or is the same as original
    if (username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setCheckingUsername(true);
        const candidate = username.trim();
        // Check availability using count to avoid single() ambiguity
        let query = supabase
          .from("User")
          .select("name", { count: "exact", head: true })
          .eq("name", candidate);

        // Exclude current user from the count
        if (user?.id) {
          query = query.neq("supabaseId", user.id);
        }

        const { count, error } = await query;

        if (error) {
          // Any error while checking should be treated as not available
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable((count ?? 0) === 0);
        }
        setCheckingUsername(false);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else if (username.length > 0) {
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, originalUsername, user]);

  const handleSaveUsername = async () => {
    if (!user) return;

    // Validate username
    const candidate = username.trim();
    if (candidate.length < 3) {
      setMessage({
        type: "error",
        text: "Benutzername muss mindestens 3 Zeichen lang sein.",
      });
      return;
    }

    if (usernameAvailable === false) {
      setMessage({ type: "error", text: "Benutzername ist nicht verfügbar." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Update in custom User table first
      const {
        data: updateData,
        error: dbError,
        count,
      } = await supabase
        .from("User")
        .update({ name: candidate })
        .eq("supabaseId", user.id)
        .select();

      console.log("Update result:", {
        updateData,
        dbError,
        count,
        supabaseId: user.id,
      });

      if (dbError) {
        // 23505 = unique_violation in Postgres
        const errText =
          dbError.code === "23505"
            ? "Benutzername bereits vergeben."
            : `Fehler beim Speichern: ${dbError.message}`;
        setMessage({ type: "error", text: errText });
        setSaving(false);
        return;
      }

      if (!updateData || updateData.length === 0) {
        setMessage({
          type: "error",
          text: "Benutzer konnte nicht aktualisiert werden. Möglicherweise fehlen Berechtigungen.",
        });
        setSaving(false);
        return;
      }

      // Update in Supabase Auth (user_metadata)
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: candidate },
      });

      if (authError) {
        // Rollback the custom User table change
        await supabase
          .from("User")
          .update({ name: originalUsername })
          .eq("supabaseId", user.id);

        setMessage({ type: "error", text: `Fehler: ${authError.message}` });
        setSaving(false);
        return;
      }

      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          name: candidate,
        },
      });
      setOriginalUsername(candidate);
      setMessage({
        type: "success",
        text: "Benutzername erfolgreich aktualisiert!",
      });
      setEditingUsername(false);
      setUsernameAvailable(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelUsername = () => {
    setUsername(originalUsername);
    setEditingUsername(false);
    setMessage(null);
    setUsernameAvailable(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unbekannt";
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              Profil wird geladen ...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nicht angemeldet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bitte melde dich an, um auf dein Profil zuzugreifen.
            </p>
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Zur Anmeldung
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Zurück zur Startseite
        </Link>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            {message.type === "success" ? (
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
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
            )}
            <p
              className={
                message.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Profile info */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                <span className="text-white font-bold text-5xl">
                  {(user.user_metadata?.name || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              {/* Future: Profile picture upload button */}
              <button
                className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50"
                disabled
                title="Profilbild ändern (bald verfügbar)"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Name and email */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.user_metadata?.name || "Kein Name festgelegt"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {user.email}
            </p>

            {/* Member since */}
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Mitglied seit {formatDate(user.created_at)}
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Username Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Benutzername
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    So wirst du in der App angezeigt
                  </p>
                </div>
              </div>
              {!editingUsername && (
                <button
                  onClick={() => setEditingUsername(true)}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {editingUsername ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Benutzername eingeben"
                    minLength={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-12"
                  />
                  {/* Status indicators */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <div className="text-green-600 text-xl">✓</div>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <div className="text-red-600 text-xl">✗</div>
                    )}
                  </div>
                </div>

                {/* Availability feedback */}
                {username !== originalUsername && (
                  <>
                    {usernameAvailable === false && username.length >= 3 && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Benutzername bereits vergeben
                      </p>
                    )}
                    {usernameAvailable === false &&
                      username.length > 0 &&
                      username.length < 3 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Mindestens 3 Zeichen erforderlich
                        </p>
                      )}
                    {usernameAvailable === true && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Benutzername verfügbar
                      </p>
                    )}
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveUsername}
                    disabled={
                      saving ||
                      usernameAvailable === false ||
                      username.length < 3 ||
                      username === originalUsername
                    }
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Wird gespeichert ...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Speichern
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelUsername}
                    disabled={saving}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-gray-900 dark:text-white font-medium">
                  {user.user_metadata?.name || (
                    <span className="text-gray-400 italic">
                      Kein Benutzername
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Email Card (Read-only) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  E-Mail-Adresse
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Deine Anmelde-E-Mail
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
              <p className="text-gray-900 dark:text-white font-medium">
                {user.email}
              </p>
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
                Schreibgeschützt
              </span>
            </div>
          </div>

          {/* User ID Card (Read-only) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Benutzer-ID
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Deine eindeutige Kennung
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400 font-mono text-sm break-all">
                {user.id}
              </p>
            </div>
          </div>

          {/* Future: Profile Picture Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-pink-600 dark:text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profilbild
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dein personalisiertes Avatar
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                Bald verfügbar
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
