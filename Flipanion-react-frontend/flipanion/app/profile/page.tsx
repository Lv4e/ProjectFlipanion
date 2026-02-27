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
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [editingPassword, setEditingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [passwordMessage, setPasswordMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

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
      const existingAvatar =
        (currentUser.user_metadata as Record<string, string>)?.avatar_url ??
        null;
      setAvatarUrl(existingAvatar);

      // Backfill: sync avatar URL to User table if it exists in auth metadata but not in DB
      if (existingAvatar) {
        const { data: dbUser } = await supabase
          .from("User")
          .select("avatarUrl")
          .eq("supabaseId", currentUser.id)
          .single();
        if (dbUser && !dbUser.avatarUrl) {
          await supabase
            .from("User")
            .update({ avatarUrl: existingAvatar })
            .eq("supabaseId", currentUser.id);
        }
      }

      setLoading(false);
    };

    fetchUser();

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

  React.useEffect(() => {
    if (username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setCheckingUsername(true);
        const candidate = username.trim();
        let query = supabase
          .from("User")
          .select("name", { count: "exact", head: true })
          .eq("name", candidate);

        if (user?.id) {
          query = query.neq("supabaseId", user.id);
        }

        const { count, error } = await query;

        if (error) {
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable((count ?? 0) === 0);
        }
        setCheckingUsername(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (username.length > 0) {
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, originalUsername, user]);

  const handleSaveUsername = async () => {
    if (!user) return;

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
      const { data: updateData, error: dbError } = await supabase
        .from("User")
        .update({ name: candidate })
        .eq("supabaseId", user.id)
        .select();

      if (dbError) {
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
          text: "Benutzer konnte nicht aktualisiert werden.",
        });
        setSaving(false);
        return;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { name: candidate },
      });

      if (authError) {
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

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Neues Passwort muss mindestens 6 Zeichen lang sein.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwörter stimmen nicht überein.",
      });
      return;
    }

    setChangingPassword(true);
    setPasswordMessage(null);

    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({
          type: "error",
          text: "Aktuelles Passwort ist falsch.",
        });
        setChangingPassword(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordMessage({
          type: "error",
          text: `Fehler beim Ändern: ${updateError.message}`,
        });
        setChangingPassword(false);
        return;
      }

      setPasswordMessage({
        type: "success",
        text: "Passwort erfolgreich geändert!",
      });
      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({
        type: "error",
        text: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setPasswordMessage(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Nur JPEG, PNG, WebP oder GIF sind erlaubt.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Bild darf maximal 5 MB groß sein." });
      return;
    }

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setMessage({
          type: "error",
          text: `Upload fehlgeschlagen: ${uploadError.message}`,
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl },
      });

      if (authError) {
        setMessage({
          type: "error",
          text: `Metadaten konnten nicht gespeichert werden: ${authError.message}`,
        });
        return;
      }

      // Also update the User table so the avatar is visible on the leaderboard
      await supabase
        .from("User")
        .update({ avatarUrl: urlData.publicUrl })
        .eq("supabaseId", user.id);

      setAvatarUrl(publicUrl);
      setMessage({
        type: "success",
        text: "Profilbild erfolgreich aktualisiert!",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Ein unerwarteter Fehler ist aufgetreten.",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Profil wird geladen ...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
          <div className="glass-card rounded-2xl py-16 px-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
              Nicht angemeldet
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Bitte melde dich an, um auf dein Profil zuzugreifen.
            </p>
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
            >
              Zur Anmeldung
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
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 mb-8 transition-colors animate-fade-in-up"
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

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up glass-card border ${
              message.type === "success"
                ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/8"
                : "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/8"
            }`}
          >
            {message.type === "success" ? (
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0"
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
                className="w-5 h-5 text-red-500 flex-shrink-0"
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
                  ? "text-green-600 dark:text-green-400 font-medium text-sm"
                  : "text-red-600 dark:text-red-400 font-medium text-sm"
              }
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8 animate-fade-in-up">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

          {/* Profile info */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center border-4 border-[var(--surface)] dark:border-[var(--background)] shadow-lg shadow-indigo-500/20 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profilbild"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-5xl">
                    {(user.user_metadata?.name || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Profilbild ändern"
                className="absolute bottom-2 right-2 w-10 h-10 bg-[var(--surface)] dark:bg-[var(--surface)] rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all border border-[var(--border)] cursor-pointer hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5 text-[var(--text-muted)]"
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
                )}
              </button>
            </div>

            {/* Name and email */}
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
              {user.user_metadata?.name || "Kein Name festgelegt"}
            </h1>
            <p className="text-[var(--text-muted)] mt-1 text-sm">
              {user.email}
            </p>

            {/* Member since */}
            <div className="mt-4 flex items-center text-sm text-[var(--text-muted)]">
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
        <div className="space-y-5">
          {/* Username Card */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up-delay-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-500"
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
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Benutzername
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    So wirst du in der App angezeigt
                  </p>
                </div>
              </div>
              {!editingUsername && (
                <button
                  onClick={() => setEditingUsername(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {editingUsername ? (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Benutzername eingeben"
                    minLength={3}
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <div className="text-green-500 text-lg">✓</div>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <div className="text-red-500 text-lg">✗</div>
                    )}
                  </div>
                </div>

                {username !== originalUsername && (
                  <>
                    {username.includes(" ") && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-2">
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
                        Leerzeichen sind nicht erlaubt
                      </p>
                    )}
                    {!username.includes(" ") &&
                      usernameAvailable === false &&
                      username.length >= 3 && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-2">
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
                    {!username.includes(" ") &&
                      usernameAvailable === false &&
                      username.length > 0 &&
                      username.length < 3 && (
                        <p className="text-xs text-amber-500 font-medium flex items-center gap-2">
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
                    {!username.includes(" ") && usernameAvailable === true && (
                      <p className="text-xs text-green-500 font-medium flex items-center gap-2">
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
                        Benutzername verfügbar ✓
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
                      username === originalUsername ||
                      username.includes(" ")
                    }
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Wird gespeichert
                      </>
                    ) : (
                      <>
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
                    className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] font-medium rounded-xl transition-colors text-sm"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                <p className="text-[var(--foreground)] font-semibold text-sm">
                  {user.user_metadata?.name || (
                    <span className="text-[var(--text-muted)] italic">
                      Kein Benutzername
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Email Card (Read-only) */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up-delay-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-violet-500"
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
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  E-Mail-Adresse
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Deine Anmelde-E-Mail
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] flex items-center justify-between">
              <p className="text-[var(--foreground)] font-semibold text-sm">
                {user.email}
              </p>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">
                Schreibgeschützt
              </span>
            </div>
          </div>

          {/* Password Card */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up-delay-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]">
                    Passwort
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Ändere dein Anmeldepasswort
                  </p>
                </div>
              </div>
              {!editingPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPassword(true);
                    setPasswordMessage(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  Ändern
                </button>
              )}
            </div>

            {/* Password feedback message */}
            {passwordMessage && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-center gap-3 border ${
                  passwordMessage.type === "success"
                    ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/8"
                    : "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/8"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
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
                    className="w-5 h-5 text-red-500 flex-shrink-0"
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
                    passwordMessage.type === "success"
                      ? "text-green-600 dark:text-green-400 font-medium text-sm"
                      : "text-red-600 dark:text-red-400 font-medium text-sm"
                  }
                >
                  {passwordMessage.text}
                </p>
              </div>
            )}

            {editingPassword ? (
              <div className="space-y-3">
                {/* Current Password */}
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Aktuelles Passwort"
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showCurrentPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Neues Passwort (mind. 6 Zeichen)"
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showNewPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm New Password */}
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Neues Passwort bestätigen"
                    className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
                  />
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {newPassword === confirmPassword ? (
                        <div className="text-green-500 text-lg">✓</div>
                      ) : (
                        <div className="text-red-500 text-lg">✗</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation hints */}
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-amber-500 font-medium flex items-center gap-2">
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
                    Mindestens 6 Zeichen erforderlich
                  </p>
                )}
                {confirmPassword.length > 0 &&
                  newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-2">
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
                      Passwörter stimmen nicht überein
                    </p>
                  )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={
                      changingPassword ||
                      currentPassword.length === 0 ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-indigo-400 disabled:to-violet-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Wird geändert
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Passwort ändern
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    disabled={changingPassword}
                    className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] font-medium rounded-xl transition-colors text-sm"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
                <p className="text-[var(--foreground)] font-semibold text-sm">
                  ••••••••
                </p>
              </div>
            )}
          </div>

          {/* Theme Card */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up-delay-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  Design-Modus
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Hell- oder Dunkelmodusdesign
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Light Mode Button */}
              <button
                onClick={() => {
                  if (theme !== "light") toggleTheme();
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                  theme === "light"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Hell
              </button>

              {/* Dark Mode Button */}
              <button
                onClick={() => {
                  if (theme !== "dark") toggleTheme();
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.354 15.354A9 9 0 015.646 5.646 9.001 9.001 0 0115.354 15.354z" />
                </svg>
                Dunkel
              </button>
            </div>
          </div>

          {/* User ID Card (Read-only) */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up-delay-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  Benutzer-ID
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Deine einigartige User ID
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
              <p className="text-[var(--text-muted)] font-mono text-xs break-all">
                {user.id}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
