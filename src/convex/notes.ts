import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let notes;
    if (args.subjectId) {
      notes = await ctx.db
        .query("notes")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
    } else {
      notes = await ctx.db
        .query("notes")
        .withIndex("by_user_updated", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    }

    return await Promise.all(
      notes.map(async (note) => {
        let subjectName: string | undefined;
        let subjectColor: string | undefined;
        if (note.subjectId) {
          const subject = await ctx.db.get(note.subjectId);
          subjectName = subject?.name;
          subjectColor = subject?.color;
        }
        return {
          ...note,
          subjectName,
          subjectColor,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId: user._id,
      title: args.title,
      content: args.content,
      subjectId: args.subjectId,
      questions: undefined,
      mindMap: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== user._id) throw new Error("Not found");
    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.subjectId !== undefined) patch.subjectId = args.subjectId;
    await ctx.db.patch(args.id, patch);
  },
});

export const getNote = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== user._id) throw new Error("Not found");
    let subjectName: string | undefined;
    let subjectColor: string | undefined;
    if (note.subjectId) {
      const subject = await ctx.db.get(note.subjectId);
      subjectName = subject?.name;
      subjectColor = subject?.color;
    }
    return { ...note, subjectName, subjectColor };
  },
});

export const saveAIResult = mutation({
  args: {
    id: v.id("notes"),
    questions: v.optional(v.array(v.string())),
    mindMap: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== user._id) throw new Error("Not found");
    const patch: Record<string, any> = { updatedAt: Date.now() };
    if (args.questions !== undefined) patch.questions = args.questions;
    if (args.mindMap !== undefined) patch.mindMap = args.mindMap;
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
