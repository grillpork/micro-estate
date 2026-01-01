import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// Video Shorts Table
export const shortVideos = pgTable("short_videos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  sharesCount: integer("shares_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shortVideosRelations = relations(shortVideos, ({ one, many }) => ({
  user: one(users, {
    fields: [shortVideos.userId],
    references: [users.id],
  }),
  likes: many(shortVideoLikes),
  comments: many(shortVideoComments),
}));

// Video Likes Table
export const shortVideoLikes = pgTable(
  "short_video_likes",
  {
    videoId: text("video_id")
      .references(() => shortVideos.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.userId] }),
  })
);

export const shortVideoLikesRelations = relations(
  shortVideoLikes,
  ({ one }) => ({
    video: one(shortVideos, {
      fields: [shortVideoLikes.videoId],
      references: [shortVideos.id],
    }),
    user: one(users, {
      fields: [shortVideoLikes.userId],
      references: [users.id],
    }),
  })
);

// Video Comments Table
export const shortVideoComments = pgTable("short_video_comments", {
  id: text("id").primaryKey(),
  videoId: text("video_id")
    .references(() => shortVideos.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shortVideoCommentsRelations = relations(
  shortVideoComments,
  ({ one }) => ({
    video: one(shortVideos, {
      fields: [shortVideoComments.videoId],
      references: [shortVideos.id],
    }),
    user: one(users, {
      fields: [shortVideoComments.userId],
      references: [users.id],
    }),
  })
);

// User Follows Table
export const userFollows = pgTable(
  "user_follows",
  {
    followerId: text("follower_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followingId: text("following_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  })
);

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "followedBy",
  }),
}));
