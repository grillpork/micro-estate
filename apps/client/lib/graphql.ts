import { api } from "./api";

export async function graphqlRequest<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const response = (await api.post("/graphql", {
    query,
    variables,
  })) as any;

  if (response.errors) {
    console.error("[GraphQL Error]", response.errors);
    throw new Error(response.errors[0]?.message || "GraphQL Error");
  }

  return response.data;
}
