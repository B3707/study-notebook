import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let tasks;
    if (args.completed !== undefined) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user_completed", (q) =>
          q.eq("userId", user._id).eq("completed", args.completed!),
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    // Sort by creation date descending
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with subject names
    return await Promise.all(
      tasks.map(async (task) => {
        const subject = await ctx.db.get(task.subjectId);
        return {
          ...task,
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
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      userId: user._id,
      subjectId: args.subjectId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      completed: false,
      priority: args.priority,
      createdAt: now,
    });
  },
});

export const toggleComplete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(args.id, { completed: !task.completed });
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
