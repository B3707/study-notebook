import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const sent = await ctx.db
      .query("friends")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "accepted"),
      )
      .collect();

    const received = await ctx.db
      .query("friends")
      .withIndex("by_friendId_status", (q) =>
        q.eq("friendId", user._id).eq("status", "accepted"),
      )
      .collect();

    const friendIds = [
      ...sent.map((f) => f.friendId),
      ...received.map((f) => f.userId),
    ];

    const friends = await Promise.all(
      friendIds.map((id) => ctx.db.get(id)),
    );

    return friends
      .filter((f): f is NonNullable<typeof f> => f !== null && !f.isAnonymous)
      .map((f) => ({
        _id: f._id,
        name: f.name,
        displayName: f.displayName,
        bio: f.bio,
      }));
  },
});

export const listRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_friendId_status", (q) =>
        q.eq("friendId", user._id).eq("status", "pending"),
      )
      .collect();

    const senders = await Promise.all(
      requests.map((r) => ctx.db.get(r.userId)),
    );

    return requests
      .map((r, i) => ({
        _id: r._id,
        senderId: r.userId,
        sender: senders[i]
          ? {
              _id: senders[i]!._id,
              name: senders[i]!.name,
              displayName: senders[i]!.displayName,
            }
          : null,
        createdAt: r.createdAt,
      }))
      .filter((r) => r.sender !== null && !r.sender!.name === undefined);
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || args.query.trim().length < 2) return [];

    // Get all users (Convex doesn't support text search natively, so we filter)
    const allUsers = await ctx.db.query("users").collect();
    const q = args.query.toLowerCase();

    // Get existing friend relationships to exclude
    const existingFriends = await ctx.db
      .query("friends")
      .withIndex("by_user_pair", (qIdx) => qIdx.eq("userId", user._id))
      .collect();
    const existingReceived = await ctx.db
      .query("friends")
      .withIndex("by_friendId", (qIdx) => qIdx.eq("friendId", user._id))
      .collect();

    const existingIds = new Set<string>();
    for (const f of [...existingFriends, ...existingReceived]) {
      existingIds.add(f.userId === user._id ? f.friendId : f.userId);
    }

    return allUsers
      .filter(
        (u) =>
          u._id !== user._id &&
          !u.isAnonymous &&
          !existingIds.has(u._id) &&
          ((u.displayName && u.displayName.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))),
      )
      .map((u) => ({
        _id: u._id,
        name: u.name,
        displayName: u.displayName,
        email: u.email,
      }));
  },
});

export const sendRequest = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user._id === args.friendId) throw new Error("Cannot add yourself");

    // Check if request already exists
    const existing = await ctx.db
      .query("friends")
      .withIndex("by_user_pair", (q) =>
        q.eq("userId", user._id).eq("friendId", args.friendId),
      )
      .first();

    if (existing) throw new Error("Request already sent");

    const reverseExisting = await ctx.db
      .query("friends")
      .withIndex("by_user_pair", (q) =>
        q.eq("userId", args.friendId).eq("friendId", user._id),
      )
      .first();

    if (reverseExisting) throw new Error("Already received a request from this user");

    await ctx.db.insert("friends", {
      userId: user._id,
      friendId: args.friendId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const acceptRequest = mutation({
  args: { requestId: v.id("friends") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request || request.friendId !== user._id) {
      throw new Error("Request not found");
    }

    await ctx.db.patch(args.requestId, { status: "accepted" });
  },
});

export const remove = mutation({
  args: { friendId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Find and delete the friendship in both directions
    const sent = await ctx.db
      .query("friends")
      .withIndex("by_user_pair", (q) =>
        q.eq("userId", user._id).eq("friendId", args.friendId),
      )
      .first();

    if (sent) {
      await ctx.db.delete(sent._id);
      return;
    }

    const received = await ctx.db
      .query("friends")
      .withIndex("by_user_pair", (q) =>
        q.eq("userId", args.friendId).eq("friendId", user._id),
      )
      .first();

    if (received) {
      await ctx.db.delete(received._id);
      return;
    }

    throw new Error("Friendship not found");
  },
});
