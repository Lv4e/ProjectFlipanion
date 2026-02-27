"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "../supabase-client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface LeaderboardEntry {
  userId: number;
  name: string;
  avatarUrl: string | null;
  quizzesCreated: number;
  quizzesCompleted: number;
  totalAnswered: number;
  totalCorrect: number;
  avgPercent: number;
  points: number;
}

interface Subject {
  id: number;
  name: string;
}

type SortKey = "points" | "avgPercent" | "quizzesCompleted" | "quizzesCreated";

const sortOptions: { key: SortKey; label: string; suffix: string }[] = [
  { key: "points", label: "Punkte", suffix: " Pkt." },
  { key: "avgPercent", label: "\u00d8 Ergebnis", suffix: "%" },
  { key: "quizzesCompleted", label: "Quizze gespielt", suffix: "" },
  { key: "quizzesCreated", label: "Quizze erstellt", suffix: "" },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<SortKey>("points");
  const [selectedSubject, setSelectedSubject] = React.useState<"all" | number>(
    "all",
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentSupabaseId, setCurrentSupabaseId] = React.useState<
    string | null
  >(null);
  const [currentDbUserId, setCurrentDbUserId] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  async function fetchLeaderboard() {
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentSupabaseId(user.id);

      // Fetch all subjects
      const { data: subjectsData } = await supabase
        .from("Subject")
        .select("id, name")
        .order("name");
      if (subjectsData) setSubjects(subjectsData);

      // Fetch all users
      const { data: users } = await supabase
        .from("User")
        .select("id, name, supabaseId, avatarUrl");
      if (!users) {
        setLoading(false);
        return;
      }

      // Find current user's db id
      if (user) {
        const me = users.find((u) => u.supabaseId === user.id);
        if (me) setCurrentDbUserId(me.id);
      }

      // Fetch all user answers with question info
      let answersQuery = supabase
        .from("UserAnswer")
        .select(
          "userId, isCorrect, question:Question(quizId, quiz:Quiz(subjectId))",
        );

      const { data: answers } = await answersQuery;

      // Fetch quizzes created (with optional subject filter)
      let quizzesQuery = supabase
        .from("Quiz")
        .select("id, creatorId, subjectId");

      const { data: quizzes } = await quizzesQuery;

      // Fetch points
      let pointsQuery = supabase
        .from("Points")
        .select("userId, subjectId, points");
      const { data: pointsData } = await pointsQuery;

      // Build leaderboard
      const map = new Map<number, LeaderboardEntry>();

      for (const u of users) {
        map.set(u.id, {
          userId: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl || null,
          quizzesCreated: 0,
          quizzesCompleted: 0,
          totalAnswered: 0,
          totalCorrect: 0,
          avgPercent: 0,
          points: 0,
        });
      }

      // Count quizzes created
      if (quizzes) {
        for (const q of quizzes) {
          if (!q.creatorId) continue;
          if (selectedSubject !== "all" && q.subjectId !== selectedSubject)
            continue;
          const entry = map.get(q.creatorId);
          if (entry) entry.quizzesCreated++;
        }
      }

      // Process answers
      if (answers) {
        // Track which quizzes each user has answered (for quizzesCompleted)
        const userQuizSets = new Map<number, Set<number>>();

        for (const a of answers as Array<Record<string, unknown>>) {
          const userId = a.userId as number;
          const question = a.question as Record<string, unknown> | null;
          if (!question) continue;
          const quizData = question.quiz as
            | Record<string, unknown>
            | Array<Record<string, unknown>>
            | null;
          if (!quizData) continue;
          const quiz = Array.isArray(quizData) ? quizData[0] : quizData;
          if (!quiz) continue;

          const subjectId = quiz.subjectId as number;
          const quizId = question.quizId as number;

          // Apply subject filter
          if (selectedSubject !== "all" && subjectId !== selectedSubject)
            continue;

          const entry = map.get(userId);
          if (!entry) continue;

          entry.totalAnswered++;
          if (a.isCorrect) entry.totalCorrect++;

          if (!userQuizSets.has(userId)) userQuizSets.set(userId, new Set());
          userQuizSets.get(userId)!.add(quizId);
        }

        // Set quizzesCompleted
        for (const [userId, quizSet] of userQuizSets) {
          const entry = map.get(userId);
          if (entry) entry.quizzesCompleted = quizSet.size;
        }
      }

      // Process points
      if (pointsData) {
        for (const p of pointsData) {
          if (selectedSubject !== "all" && p.subjectId !== selectedSubject)
            continue;
          const entry = map.get(p.userId);
          if (entry) entry.points += p.points;
        }
      }

      // Calculate avg percent
      for (const entry of map.values()) {
        entry.avgPercent =
          entry.totalAnswered > 0
            ? Math.round((entry.totalCorrect / entry.totalAnswered) * 100)
            : 0;
      }

      setEntries(Array.from(map.values()));
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter & sort
  const { filtered, allSorted, totalCount } = React.useMemo(() => {
    let list = [...entries];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(term));
    }

    // Sort by selected metric descending
    list.sort((a, b) => {
      const diff = b[sortBy] - a[sortBy];
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });

    const total = list.length;
    // Only top 10
    return { filtered: list.slice(0, 10), allSorted: list, totalCount: total };
  }, [entries, searchTerm, sortBy]);

  // Find current user's rank (in the full list, not just top 10)
  const myRank = React.useMemo(() => {
    if (!currentDbUserId) return null;
    const idx = allSorted.findIndex((e) => e.userId === currentDbUserId);
    return idx >= 0 ? idx + 1 : null;
  }, [allSorted, currentDbUserId]);

  const myEntry = React.useMemo(() => {
    if (!currentDbUserId) return null;
    return entries.find((e) => e.userId === currentDbUserId) ?? null;
  }, [entries, currentDbUserId]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-amber-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-orange-400 to-amber-600";
    return "";
  };

  const getRankLabel = (rank: number) => {
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-1">
            Leaderboard
          </h1>
          <p className="text-[var(--text-muted)]">
            Vergleiche dich mit anderen Nutzern und sieh, wer die besten
            Ergebnisse hat.
          </p>
        </div>

        {/* My Stats Card */}
        {myEntry && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up-delay-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  {myEntry.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={myEntry.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {myEntry.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    Dein Rang
                  </p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {myRank ? `#${myRank}` : "—"}{" "}
                    <span className="text-base font-medium text-[var(--text-muted)]">
                      von {totalCount}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:ml-auto">
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-indigo-500">
                    {myEntry.avgPercent}%
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Ø Ergebnis</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-purple-500">
                    {myEntry.quizzesCompleted}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Quizze gespielt
                  </p>
                </div>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-blue-500">
                    {myEntry.quizzesCreated}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Erstellt</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-in-up-delay-2">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Nutzer suchen ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Subject filter */}
            <select
              value={
                selectedSubject === "all" ? "all" : String(selectedSubject)
              }
              onChange={(e) =>
                setSelectedSubject(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
            >
              <option value="all">Alle Fächer</option>
              {subjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  Top 10: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Leaderboard wird geladen ...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-[var(--foreground)] font-medium mb-1">
              Keine Nutzer gefunden
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {searchTerm
                ? "Versuche einen anderen Suchbegriff."
                : "Noch keine Aktivität vorhanden."}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {filtered.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up-delay-3">
                {[1, 0, 2].map((podiumIdx) => {
                  const rank = podiumIdx + 1;
                  const entry = filtered[podiumIdx];
                  if (!entry) return null;
                  const isMe = entry.userId === currentDbUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`glass-card rounded-2xl p-5 text-center relative overflow-hidden transition-all ${
                        rank === 1 ? "md:-mt-4" : ""
                      } ${isMe ? "ring-2 ring-indigo-500/40" : ""}`}
                    >
                      {rank <= 3 && (
                        <div
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60"
                          style={{
                            backgroundImage:
                              rank === 1
                                ? "linear-gradient(to right, #fbbf24, #f59e0b)"
                                : rank === 2
                                  ? "linear-gradient(to right, #9ca3af, #6b7280)"
                                  : "linear-gradient(to right, #fb923c, #ea580c)",
                          }}
                        />
                      )}
                      <div className="text-lg font-bold text-[var(--text-muted)] mb-2">
                        {getRankLabel(rank)}
                      </div>
                      <div
                        className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-lg mb-3 ${
                          rank <= 3
                            ? `bg-gradient-to-br ${getMedalColor(rank)}`
                            : "bg-gradient-to-br from-indigo-500 to-violet-600"
                        }`}
                      >
                        {entry.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-[var(--foreground)] text-sm truncate">
                        {entry.name}
                        {isMe && (
                          <span className="text-indigo-500 ml-1">(Du)</span>
                        )}
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mt-1">
                        {entry[sortBy]}
                        {sortOptions.find((o) => o.key === sortBy)?.suffix}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {sortOptions.find((o) => o.key === sortBy)?.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-10 gap-2 px-5 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Nutzer</div>
                <div className="col-span-2 text-center">Ø Ergebnis</div>
                <div className="col-span-2 text-center hidden md:block">
                  Quizze
                </div>
                <div className="col-span-2 text-center">Punkte</div>
              </div>

              {/* Rows */}
              {filtered.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.userId === currentDbUserId;
                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-10 gap-2 px-5 py-3.5 items-center transition-colors ${
                      isMe
                        ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-2 border-indigo-500"
                        : "hover:bg-[var(--surface-hover)] border-l-2 border-transparent"
                    } ${idx < filtered.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <span
                        className={`text-sm font-bold ${rank <= 3 ? "text-indigo-500" : "text-[var(--text-muted)]"}`}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* User */}
                    <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                        {entry.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-xs">
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium truncate ${isMe ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--foreground)]"}`}
                      >
                        {entry.name}
                        {isMe && (
                          <span className="text-xs ml-1 opacity-70">(Du)</span>
                        )}
                      </span>
                    </div>

                    {/* Avg Percent */}
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 bg-[var(--border)] rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className={`h-1.5 rounded-full ${
                              entry.avgPercent >= 80
                                ? "bg-green-500"
                                : entry.avgPercent >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${entry.avgPercent}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            entry.avgPercent >= 80
                              ? "text-green-600 dark:text-green-400"
                              : entry.avgPercent >= 50
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {entry.avgPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Quizzes */}
                    <div className="col-span-2 text-center hidden md:flex md:justify-center md:gap-3">
                      <span
                        className="text-xs text-[var(--text-muted)]"
                        title="Gespielt"
                      >
                        Gespielt: {entry.quizzesCompleted}
                      </span>
                      <span
                        className="text-xs text-[var(--text-muted)]"
                        title="Erstellt"
                      >
                        Erstellt: {entry.quizzesCreated}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-bold text-[var(--foreground)]">
                        {entry.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center mt-4">
              Top {filtered.length} von {totalCount}{" "}
              {totalCount === 1 ? "Nutzer" : "Nutzern"}
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
