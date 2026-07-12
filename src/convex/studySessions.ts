import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let sessions;
    if (args.date) {
      sessions = await ctx.db
        .query("studySessions")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", user._id).eq("date", args.date!),
        )
        .collect();
    } else {
      sessions = await ctx.db
        .query("studySessions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    // Enrich with subject names
    return await Promise.all(
      sessions.map(async (session) => {
        const subject = await ctx.db.get(session.subjectId);
        return {
          ...session,
          subjectName: subject?.name ?? "Unknown",
          subjectColor: subject?.color ?? "#666",
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    subjectId: v.id("subjects"),
    duration: v.number(),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("studySessions", {
      userId: user._id,
      subjectId: args.subjectId,
      duration: args.duration,
      date: args.date,
      notes: args.notes,
      createdAt: now,
    });
  },
});

export const getSession = query({
  args: { id: v.id("studySessions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) throw new Error("Not found");
    const subject = await ctx.db.get(session.subjectId);
    return {
      ...session,
      subjectName: subject?.name ?? "Unknown",
      subjectColor: subject?.color ?? "#666",
    };
  },
});

export const remove = mutation({
  args: {
    id: v.id("studySessions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { totalMinutes: 0, totalSessions: 0, sessionsBySubject: [] };

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    // Group by subject
    const bySubject = new Map<string, number>();
    for (const session of sessions) {
      bySubject.set(session.subjectId, (bySubject.get(session.subjectId) ?? 0) + session.duration);
    }

    const sessionsBySubject = await Promise.all(
      Array.from(bySubject.entries()).map(async ([subjectId, minutes]) => {
        const subject = await ctx.db.get(subjectId as any) as { name?: string; color?: string } | null;
        return {
          subjectName: subject?.name ?? "Unknown",
          subjectColor: subject?.color ?? "#666",
          minutes,
        };
      }),
    );

    return {
      totalMinutes,
      totalSessions: sessions.length,
      sessionsBySubject,
    };
  },
});
