import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { auth } from "../../lib/auth";
import type { AuthUser } from "../../shared/types";

// Create GraphQL schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// Create Yoga instance
export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/v1/graphql",
  landingPage: true,
  graphiql: {
    title: "Micro Estate GraphQL",
  },
  context: async ({ request }): Promise<{ user: AuthUser | null }> => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        return {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || null,
            role: (session.user as any).role || "user",
            image: session.user.image || null,
          },
        };
      }
    } catch (error) {
      // Ignore auth errors
    }

    return { user: null };
  },
});
