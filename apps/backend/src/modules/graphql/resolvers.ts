import { eq, desc, and, asc, sql, ilike, or, gte, lte } from "drizzle-orm";
import { db } from "../../db";
import {
  users,
  properties,
  propertyImages,
  messages,
  notifications,
  favorites,
} from "../../db/schema";
import { connectionManager } from "../../lib/websocket";
import * as chatService from "../chat/chat.service";
import * as notificationService from "../notifications/notifications.service";
import * as favoriteService from "../favorites/favorites.service";
import { UnauthorizedError } from "../../shared/errors";
import type { AuthUser } from "../../shared/types";

// ===== Context Type =====
interface GraphQLContext {
  user: AuthUser | null;
}

// ===== Helper: Require Auth =====
function requireAuth(ctx: GraphQLContext): AuthUser {
  if (!ctx.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return ctx.user;
}

// ===== Resolvers =====
export const resolvers = {
  // ===== Query Resolvers =====
  Query: {
    // Users
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id));
      return user;
    },

    user: async (_: unknown, { id }: { id: string }) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    },

    users: async (
      _: unknown,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number }
    ) => {
      return db.select().from(users).limit(limit).offset(offset);
    },

    // Properties
    property: async (_: unknown, { id }: { id: string }) => {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id));
      return property;
    },

    propertyBySlug: async (_: unknown, { slug }: { slug: string }) => {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.slug, slug));
      if (property) {
        await db
          .update(properties)
          .set({ views: sql`${properties.views} + 1` })
          .where(eq(properties.id, property.id));
      }
      return property;
    },

    properties: async (
      _: unknown,
      {
        first = 20,
        after,
        filter,
        sort,
      }: {
        first?: number;
        after?: string;
        filter?: {
          propertyType?: string;
          listingType?: string;
          status?: string;
          minPrice?: number;
          maxPrice?: number;
          bedrooms?: number;
          bathrooms?: number;
          province?: string;
          q?: string;
        };
        sort?: { field: string; order: "asc" | "desc" };
      }
    ) => {
      const conditions = [eq(properties.status, "active")];

      if (filter?.propertyType)
        conditions.push(
          eq(properties.propertyType, filter.propertyType as any)
        );
      if (filter?.listingType)
        conditions.push(eq(properties.listingType, filter.listingType as any));
      if (filter?.province)
        conditions.push(eq(properties.province, filter.province));
      if (filter?.bedrooms)
        conditions.push(eq(properties.bedrooms, filter.bedrooms));
      if (filter?.bathrooms)
        conditions.push(eq(properties.bathrooms, filter.bathrooms));
      if (filter?.minPrice)
        conditions.push(gte(properties.price, filter.minPrice.toString()));
      if (filter?.maxPrice)
        conditions.push(lte(properties.price, filter.maxPrice.toString()));
      if (filter?.q) {
        conditions.push(
          or(
            ilike(properties.title, `%${filter.q}%`),
            ilike(properties.description, `%${filter.q}%`)
          )!
        );
      }

      const sortField = sort?.field || "createdAt";
      const sortOrder = sort?.order === "asc" ? asc : desc;
      const orderBy = sortOrder(
        properties[sortField as keyof typeof properties] as any
      );

      const results = await db
        .select()
        .from(properties)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(first + 1);

      const hasNextPage = results.length > first;
      const edges = results.slice(0, first).map((node) => ({
        node,
        cursor: node.id,
      }));

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(and(...conditions));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: Number(count),
      };
    },

    myProperties: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return db
        .select()
        .from(properties)
        .where(eq(properties.userId, user.id))
        .orderBy(desc(properties.createdAt));
    },

    featuredProperties: async (
      _: unknown,
      { limit = 10 }: { limit?: number }
    ) => {
      return db
        .select()
        .from(properties)
        .where(
          and(eq(properties.status, "active"), eq(properties.isFeatured, true))
        )
        .orderBy(desc(properties.createdAt))
        .limit(limit);
    },

    // Search
    searchProperties: async (
      _: unknown,
      { q, limit = 20 }: { q: string; limit?: number }
    ) => {
      return db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.status, "active"),
            or(
              ilike(properties.title, `%${q}%`),
              ilike(properties.description, `%${q}%`),
              ilike(properties.address, `%${q}%`)
            )
          )
        )
        .limit(limit);
    },

    searchSuggestions: async (_: unknown, { q }: { q: string }) => {
      const results = await db
        .select({ title: properties.title, province: properties.province })
        .from(properties)
        .where(
          and(
            eq(properties.status, "active"),
            or(
              ilike(properties.title, `%${q}%`),
              ilike(properties.province, `%${q}%`)
            )
          )
        )
        .limit(10);

      const suggestions = new Set<string>();
      results.forEach((r) => {
        if (r.title?.toLowerCase().includes(q.toLowerCase()))
          suggestions.add(r.title);
        if (r.province?.toLowerCase().includes(q.toLowerCase()))
          suggestions.add(r.province);
      });
      return Array.from(suggestions).slice(0, 5);
    },

    // Chat
    conversations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return chatService.getConversations(user.id);
    },

    messages: async (
      _: unknown,
      {
        partnerId,
        first = 50,
        after,
      }: { partnerId: string; first?: number; after?: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return chatService.getMessages(user.id, {
        partnerId,
        limit: first,
        cursor: after,
      });
    },

    unreadMessageCount: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return chatService.getUnreadCount(user.id);
    },

    // Notifications
    notifications: async (
      _: unknown,
      { first = 20, after }: { first?: number; after?: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const result = await notificationService.getUserNotifications(user.id, {
        limit: first,
        cursor: after,
      });
      return result.notifications;
    },

    unreadNotificationCount: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return notificationService.getUnreadNotificationCount(user.id);
    },

    // Favorites
    myFavorites: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const favs = await favoriteService.getUserFavorites(user.id);
      return favs.map((f: any) => f.property);
    },

    isFavorited: async (
      _: unknown,
      { propertyId }: { propertyId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return favoriteService.isFavorited(user.id, propertyId);
    },

    // Online Status
    usersOnlineStatus: async (
      _: unknown,
      { userIds }: { userIds: string[] }
    ) => {
      const statuses = await connectionManager.getOnlineStatuses(userIds);
      return userIds.map((userId) => ({
        userId,
        isOnline: statuses.get(userId) || false,
        lastSeen: null,
      }));
    },
  },

  // ===== Mutation Resolvers =====
  Mutation: {
    sendMessage: async (
      _: unknown,
      {
        receiverId,
        content,
        imageUrls,
      }: { receiverId: string; content?: string; imageUrls?: string[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return chatService.sendMessage(user.id, {
        receiverId,
        content,
        imageUrls,
      });
    },

    markMessagesAsRead: async (
      _: unknown,
      { messageIds }: { messageIds: string[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await chatService.markMessagesAsRead(user.id, messageIds);
      return true;
    },

    markNotificationsAsRead: async (
      _: unknown,
      { notificationIds }: { notificationIds: string[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await notificationService.markNotificationsAsRead(
        user.id,
        notificationIds
      );
      return true;
    },

    markAllNotificationsAsRead: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await notificationService.markAllNotificationsAsRead(user.id);
      return true;
    },

    addFavorite: async (
      _: unknown,
      { propertyId }: { propertyId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await favoriteService.addFavorite(user.id, propertyId);
      return true;
    },

    removeFavorite: async (
      _: unknown,
      { propertyId }: { propertyId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await favoriteService.removeFavorite(user.id, propertyId);
      return true;
    },

    toggleFavorite: async (
      _: unknown,
      { propertyId }: { propertyId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const result = await favoriteService.toggleFavorite(user.id, propertyId);
      return result.favorited;
    },
  },

  // ===== Field Resolvers =====
  Property: {
    images: async (property: { id: string }) => {
      return db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, property.id))
        .orderBy(asc(propertyImages.order));
    },

    owner: async (property: { userId: string }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, property.userId));
      return user;
    },

    features: (property: { features: string | null }) => {
      return property.features ? JSON.parse(property.features) : [];
    },

    amenities: (property: { amenities: string | null }) => {
      return property.amenities ? JSON.parse(property.amenities) : [];
    },

    isFavorited: async (
      property: { id: string },
      _: unknown,
      ctx: GraphQLContext
    ) => {
      if (!ctx.user) return false;
      return favoriteService.isFavorited(ctx.user.id, property.id);
    },
  },

  User: {
    isOnline: (user: { id: string }) => {
      return connectionManager.isConnected(user.id);
    },
  },

  Message: {
    imageUrls: (message: { imageUrls: string | null }) => {
      return message.imageUrls ? JSON.parse(message.imageUrls) : null;
    },
  },
};
