import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      displayName: v.optional(v.string()), // display name for profile
      bio: v.optional(v.string()), // short bio for profile
      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Subjects / courses the student is studying
    subjects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      color: v.string(),
      description: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Individual study sessions
    studySessions: defineTable({
      userId: v.id("users"),
      subjectId: v.id("subjects"),
      duration: v.number(), // in minutes
      date: v.string(), // ISO date string
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_subject", ["subjectId"])
      .index("by_user_date", ["userId", "date"]),

    // Tasks / homework assignments
    tasks: defineTable({
      userId: v.id("users"),
      subjectId: v.id("subjects"),
      title: v.string(),
      description: v.optional(v.string()),
      dueDate: v.optional(v.string()),
      completed: v.boolean(),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_subject", ["subjectId"])
      .index("by_user_completed", ["userId", "completed"]),

    // Friends / study buddies
    friends: defineTable({
      userId: v.id("users"),          // who sent the request
      friendId: v.id("users"),         // who received it
      status: v.union(v.literal("pending"), v.literal("accepted")),
      createdAt: v.number(),
    })
      .index("by_userId", ["userId"])
      .index("by_friendId", ["friendId"])
      .index("by_userId_status", ["userId", "status"])
      .index("by_friendId_status", ["friendId", "status"])
      .index("by_user_pair", ["userId", "friendId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
