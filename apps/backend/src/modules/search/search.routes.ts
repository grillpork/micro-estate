import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { success, paginate } from "../../shared/utils";
import * as service from "./search.service";
import { searchQuerySchema } from "./search.schema";

export const searchRoutes = new Hono();

// Search properties
searchRoutes.get(
  "/properties",
  zValidator("query", searchQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const result = await service.searchProperties(query);
    return paginate(
      c,
      result.data,
      result.total,
      result.page,
      result.limit,
      result.offset
    );
  }
);

// Search agents
searchRoutes.get("/agents", async (c) => {
  const q = c.req.query("q") || "";
  const agents = await service.searchAgents(q);
  return success(c, agents);
});

// Get search suggestions
searchRoutes.get("/suggestions", async (c) => {
  const q = c.req.query("q") || "";
  if (q.length < 2) {
    return success(c, []);
  }
  const suggestions = await service.getSuggestions(q);
  return success(c, suggestions);
});
