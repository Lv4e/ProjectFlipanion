"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "../supabase-client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { BookOpen, Trophy, BarChart3, Gamepad2, PenTool } from "lucide-react";

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
  streak: number;
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

      // Fetch quiz attempts (only first attempts where points were awarded)
      const { data: attemptsData } = await supabase
        .from("QuizAttempt")
        .select("userId, quizId, points, pointsAwarded, quiz:Quiz(subjectId)")
        .eq("pointsAwarded", true);

      // Fetch streaks from UserStatistics
      const { data: statsData } = await supabase
        .from("UserStatistics")
        .select("userId, streak");

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
          streak: 0,
        });
      }

      // Apply streaks
      if (statsData) {
        for (const s of statsData) {
          const entry = map.get(s.userId);
          if (entry) entry.streak = (s.streak as number) ?? 0;
        }
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

      // Process points from QuizAttempt
      if (attemptsData) {
        for (const a of attemptsData as Array<Record<string, unknown>>) {
          const quizRelation = a.quiz as
            | Record<string, unknown>
            | Array<Record<string, unknown>>
            | null;
          const quiz = Array.isArray(quizRelation)
            ? quizRelation[0]
            : quizRelation;
          const subjectId = quiz?.subjectId as number | undefined;
          if (selectedSubject !== "all" && subjectId !== selectedSubject)
            continue;
          const entry = map.get(a.userId as number);
          if (entry) entry.points += (a.points as number) || 0;
        }
      }

      // Round points for display
      for (const entry of map.values()) {
        entry.points = parseFloat(entry.points.toFixed(2));
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

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 mb-4 transition-colors"
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
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-1">
            Leaderboard
          </h1>
          <p className="text-[var(--text-muted)]">
            Vergleiche dich mit anderen Nutzern und sieh, wer die besten
            Ergebnisse hat.
          </p>

          {/* Streak Explanation */}
          <div className="mt-4 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/15 text-sm text-orange-800 dark:text-orange-300">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <span>🔥</span> Streak-System
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
              Pro Quiz bekommst du nur beim ersten Mal Punkte. Schließe Quizze
              mit über 90 % ab, um eine Streak aufzubauen. Ab 2× hintereinander
              über 90 % erhältst du einen Bonus-Multiplikator auf deine Punkte
              (×1.1, ×1.2, ×1.3 …). Unter 90 % wird die Streak zurückgesetzt.
            </p>
          </div>
        </div>

        {/* My Stats Card */}
        {myEntry && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up-delay-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
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
                  <p className="text-2xl font-bold text-rose-500">
                    {myEntry.avgPercent}%
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Ø Ergebnis</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-pink-500">
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
                {myEntry.streak >= 1 && (
                  <div className="text-center px-4">
                    <p className="text-2xl font-bold text-orange-500">
                      🔥 {myEntry.streak}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Streak</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-in-up-delay-2 relative z-40">
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
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-all"
              />
            </div>

            {/* Subject filter */}
            <FluidDropdown
              items={[
                { id: 'all', label: 'Alle Fächer', icon: BookOpen, color: '#fb7185' },
                ...subjects.map((s) => ({
                  id: String(s.id),
                  label: s.name,
                })),
              ]}
              value={selectedSubject === 'all' ? 'all' : String(selectedSubject)}
              onChange={(val) => setSelectedSubject(val === 'all' ? 'all' : Number(val))}
              placeholder="Alle Fächer"
            />

            {/* Sort */}
            <FluidDropdown
              items={sortOptions.map((o) => ({
                id: o.key,
                label: `Top 10: ${o.label}`,
                icon: o.key === 'points' ? Trophy : o.key === 'avgPercent' ? BarChart3 : o.key === 'quizzesCompleted' ? Gamepad2 : PenTool,
                color: '#fb7185',
              }))}
              value={sortBy}
              onChange={(val) => setSortBy(val as SortKey)}
              placeholder="Top 10: Punkte"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Leaderboard wird geladen ...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-rose-400"
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
                      } ${isMe ? "ring-2 ring-rose-500/40" : ""}`}
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
                            : "bg-gradient-to-br from-rose-500 to-pink-600"
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
                          <span className="text-rose-500 ml-1">(Du)</span>
                        )}
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mt-1">
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
                        ? "bg-rose-50/50 dark:bg-rose-500/5 border-l-2 border-rose-500"
                        : "hover:bg-[var(--surface-hover)] border-l-2 border-transparent"
                    } ${idx < filtered.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <span
                        className={`text-sm font-bold ${rank <= 3 ? "text-rose-500" : "text-[var(--text-muted)]"}`}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* User */}
                    <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
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
                        className={`text-sm font-medium truncate ${isMe ? "text-rose-600 dark:text-rose-400" : "text-[var(--foreground)]"}`}
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
                      {entry.streak >= 2 && (
                        <span
                          className="ml-1 text-xs text-orange-500"
                          title={`Streak: ${entry.streak} (×${(1 + (entry.streak - 1) * 0.1).toFixed(1)})`}
                        >
                          🔥{entry.streak}
                        </span>
                      )}
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
