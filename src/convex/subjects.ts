import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("subjects", {
      userId: user._id,
      name: args.name,
      color: args.color,
      description: args.description,
      createdAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const subject = await ctx.db.get(args.id);
    if (!subject || subject.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
