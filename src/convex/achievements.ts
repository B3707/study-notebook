import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const ACHIEVEMENT_DEFS = [
  {
    id: "double-down",
    name: "The Double Down",
    description: "Complete two back-to-back Pomodoro sessions with only a short break between them.",
    icon: "⟳",
    category: "time",
  },
  {
    id: "half-day-hustle",
    name: "Half-Day Hustle",
    description: "Log a cumulative total of 12 hours of study time within a single week.",
    icon: "☀️",
    category: "time",
  },
  {
    id: "part-time-pro",
    name: "Part-Time Pro",
    description: "Hit 20 hours of total study time in a single week.",
    icon: "⚡",
    category: "time",
  },
  {
    id: "the-overtime",
    name: "The Overtime",
    description: "Exceed your daily study goal by 50% or more.",
    icon: "📈",
    category: "time",
  },
  {
    id: "silver-jubilee",
    name: "Silver Jubilee",
    description: "Accumulate 25 hours of total time across all sessions.",
    icon: "🥈",
    category: "time",
  },
  {
    id: "kilo-hour",
    name: "Kilo-Hour",
    description: "Hit the ultimate milestone—1,000 total hours logged in the app.",
    icon: "🏆",
    category: "time",
  },
  {
    id: "consistent-output",
    name: "Consistent Output",
    description: "Log at least 1 hour of study every single day for two weeks straight.",
    icon: "📅",
    category: "time",
  },
  {
    id: "hyperfocus",
    name: "Hyperfocus",
    description: "Complete a 50-minute or 60-minute deep-work session without a single pause.",
    icon: "🎯",
    category: "efficiency",
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    description: "Complete at least one study session every day for 7 consecutive days.",
    icon: "⭐",
    category: "efficiency",
  },
  {
    id: "subject-specialist",
    name: "Subject Specialist",
    description: "Log 20 hours in one specific subject or project.",
    icon: "📚",
    category: "efficiency",
  },
  {
    id: "balanced-diet",
    name: "Balanced Diet",
    description: "Spend at least 2 hours each on 3 different subjects within the same week.",
    icon: "⚖️",
    category: "efficiency",
  },
  {
    id: "comeback-kid",
    name: "Comeback Kid",
    description: "Complete a session on a subject you haven't touched or logged in over 2 weeks.",
    icon: "🔄",
    category: "efficiency",
  },
  {
    id: "monotasking-master",
    name: "Monotasking Master",
    description: "Spend an entire day focusing on exclusively one subject without switching tasks.",
    icon: "🎯",
    category: "efficiency",
  },
];

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export const list = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return ACHIEVEMENT_DEFS.map((a) => ({ ...a, earned: false }));
    }

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (sessions.length === 0) {
      return ACHIEVEMENT_DEFS.map((a) => ({ ...a, earned: false }));
    }

    const earned = new Set<string>();

    // === Compute base data ===

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    // Group by date
    const byDate = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const existing = byDate.get(s.date) ?? [];
      existing.push(s);
      byDate.set(s.date, existing);
    }

    // Daily minutes
    const dailyMinutes = new Map<string, number>();
    for (const [date, daySessions] of byDate) {
      dailyMinutes.set(date, daySessions.reduce((sum, s) => sum + s.duration, 0));
    }

    // Sorted unique dates
    const sortedDates = Array.from(byDate.keys()).sort();
    const dateSet = new Set(sortedDates);

    // Group sessions by subject
    const bySubject = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const existing = bySubject.get(s.subjectId) ?? [];
      existing.push(s);
      bySubject.set(s.subjectId, existing);
    }

    // === 1. The Double Down ===
    // Any day with 2+ sessions
    for (const [, daySessions] of byDate) {
      if (daySessions.length >= 2) {
        earned.add("double-down");
        break;
      }
    }

    // === 2. Half-Day Hustle (720 min in 7-day window) ===
    // === 3. Part-Time Pro (1200 min in 7-day window) ===
    // === 12. Balanced Diet (120+ min on 3+ subjects in same week) ===
    for (let i = 0; i < sortedDates.length; i++) {
      const windowStart = parseDate(sortedDates[i]);
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + 7);

      let windowTotal = 0;
      const subjMinutes = new Map<string, number>();

      for (const date of sortedDates) {
        const d = parseDate(date);
        if (d >= windowStart && d < windowEnd) {
          const dayTotal = dailyMinutes.get(date) ?? 0;
          windowTotal += dayTotal;

          const daySessions = byDate.get(date) ?? [];
          for (const s of daySessions) {
            subjMinutes.set(
              s.subjectId,
              (subjMinutes.get(s.subjectId) ?? 0) + s.duration,
            );
          }
        }
      }

      if (windowTotal >= 720) earned.add("half-day-hustle");
      if (windowTotal >= 1200) earned.add("part-time-pro");

      const subjectsWith120 = Array.from(subjMinutes.values()).filter(
        (m) => m >= 120,
      );
      if (subjectsWith120.length >= 3) earned.add("balanced-diet");
    }

    // === 4. The Overtime (any day with 180+ min) ===
    for (const [, total] of dailyMinutes) {
      if (total >= 180) {
        earned.add("the-overtime");
        break;
      }
    }

    // === 5. Silver Jubilee (1500 min = 25h total) ===
    if (totalMinutes >= 1500) earned.add("silver-jubilee");

    // === 6. Kilo-Hour (60000 min = 1000h total) ===
    if (totalMinutes >= 60000) earned.add("kilo-hour");

    // === 7. Consistent Output (60+ min every day for 14 consecutive days) ===
    for (let i = 0; i <= sortedDates.length - 14; i++) {
      const start = parseDate(sortedDates[i]);
      const end = parseDate(sortedDates[i + 13]);
      const span = diffDays(start, end);

      if (span === 13) {
        const allHave60 = sortedDates
          .slice(i, i + 14)
          .every((d) => (dailyMinutes.get(d) ?? 0) >= 60);

        if (allHave60) {
          earned.add("consistent-output");
          break;
        }
      }
    }

    // === 8. Hyperfocus (any single session >= 50 min) ===
    for (const s of sessions) {
      if (s.duration >= 50) {
        earned.add("hyperfocus");
        break;
      }
    }

    // === 9. Perfect Week (session every day for 7 consecutive days) ===
    for (let i = 0; i <= sortedDates.length - 7; i++) {
      const start = parseDate(sortedDates[i]);
      const end = parseDate(sortedDates[i + 6]);
      const span = diffDays(start, end);

      if (span === 6) {
        earned.add("perfect-week");
        break;
      }
    }

    // === 10. Subject Specialist (1200 min = 20h in one subject) ===
    for (const [, subjectSessions] of bySubject) {
      const subjTotal = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
      if (subjTotal >= 1200) {
        earned.add("subject-specialist");
        break;
      }
    }

    // === 13. Comeback Kid (subject with sessions 14+ days apart) ===
    for (const [, subjectSessions] of bySubject) {
      const dates = [
        ...new Set(subjectSessions.map((s) => s.date)),
      ].sort();
      for (let i = 1; i < dates.length; i++) {
        const prev = parseDate(dates[i - 1]);
        const curr = parseDate(dates[i]);
        if (diffDays(prev, curr) >= 14) {
          earned.add("comeback-kid");
          break;
        }
      }
      if (earned.has("comeback-kid")) break;
    }

    // === 14. Monotasking Master (all sessions on a single day are one subject) ===
    for (const [, daySessions] of byDate) {
      if (daySessions.length > 0) {
        const uniqueSubjects = new Set(daySessions.map((s) => s.subjectId));
        if (uniqueSubjects.size === 1) {
          earned.add("monotasking-master");
          break;
        }
      }
    }

    return ACHIEVEMENT_DEFS.map((a) => ({
      ...a,
      earned: earned.has(a.id),
    }));
  },
});
