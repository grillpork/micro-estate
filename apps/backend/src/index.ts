import "dotenv/config";
import type { ServerWebSocket } from "bun";
import gateway from "./gateway";
import { env } from "./config/env";
import { wsHandlers, authenticateWebSocket } from "./modules/websocket";
import type { WebSocketData } from "./lib/websocket";

console.log(`
🚀 Micro Estate Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server:    http://localhost:${env.PORT}
🔧 Mode:      ${env.NODE_ENV}
📚 REST API:  http://localhost:${env.PORT}/api/v1
📊 GraphQL:   http://localhost:${env.PORT}/api/v1/graphql
🔌 WebSocket: ws://localhost:${env.PORT}/ws
💚 Health:    http://localhost:${env.PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

export default {
  port: env.PORT,
  fetch: async (request: Request, server: any) => {
    const url = new URL(request.url);

    // Handle WebSocket upgrade
    if (url.pathname === "/ws") {
      const userData = await authenticateWebSocket(request);

      if (!userData) {
        return new Response("Unauthorized", { status: 401 });
      }

      const success = server.upgrade(request, { data: userData });
      if (success) {
        return undefined;
      }
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    // Handle regular HTTP requests
    return gateway.fetch(request, server);
  },
  websocket: {
    open: (ws: ServerWebSocket<WebSocketData>) => wsHandlers.open(ws),
    message: (ws: ServerWebSocket<WebSocketData>, message: string | Buffer) =>
      wsHandlers.message(ws, message),
    close: (ws: ServerWebSocket<WebSocketData>) => wsHandlers.close(ws),
    error: (ws: ServerWebSocket<WebSocketData>, error: Error) =>
      wsHandlers.error(ws, error),
  },
};
