import { cache } from "react";
import type {
  HomeStats,
  FeaturedProperty,
  PropertyTypeCount,
} from "@/services";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface HomeData {
  stats: HomeStats;
  propertyTypeCounts: PropertyTypeCount[];
  featuredProperties: FeaturedProperty[];
}

export const getHomeData = cache(async (): Promise<HomeData | null> => {
  try {
    const res = await fetch(`${API_URL}/home`, {
      next: {
        tags: ["home-data"],
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch home data: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching home data:", error);
    return null;
  }
});
