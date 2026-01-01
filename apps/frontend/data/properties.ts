import { cache } from "react";
import type { Property, PaginatedResponse } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const getProperty = async (term: string): Promise<Property | null> => {
  try {
    const encodedTerm = encodeURIComponent(term);
    const url = `${API_URL}/properties/${encodedTerm}`;
    console.log(`[getProperty] Fetching: ${url}`);

    const res = await fetch(url, {
      cache: "no-store", // Disable cache to prevent stale 404s
      next: { tags: [`property-${term}`] },
    });

    if (!res.ok) {
      console.log(
        `[getProperty] Failed with status: ${res.status} ${res.statusText}`
      );
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch property: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("[getProperty] Error:", error);
    return null;
  }
};

export const getProperties = cache(
  async (
    searchParams?: Record<string, any>
  ): Promise<PaginatedResponse<Property>> => {
    const queryString = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/search/properties${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      next: {
        tags: ["properties"],
        revalidate: 60,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to search properties");
    }

    const json = await res.json();
    return {
      data: json.data,
      meta: json.meta,
    };
  }
);
