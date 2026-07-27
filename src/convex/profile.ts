import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const update = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const patch: Record<string, string> = {};
    if (args.displayName !== undefined) patch.displayName = args.displayName;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.profilePicture !== undefined) patch.profilePicture = args.profilePicture;

    await ctx.db.patch(user._id, patch);
  },
});

/**
 * Generate an upload URL for the client to upload a profile picture.
 * The client POSTs the file to this URL, then passes the returned storageId
 * to the update mutation as `profilePicture`.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Given a Convex storage ID, return a temporary URL to view the file.
 * Returns null if the storage ID is empty, undefined, or invalid.
 */
export const getImageUrl = query({
  args: { storageId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    try {
      return await ctx.storage.getUrl(args.storageId as any);
    } catch {
      return null;
    }
  },
});
