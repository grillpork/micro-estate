import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { propertiesService, type SearchPropertiesParams } from "@/services";
import { Navbar, Footer } from "@/components/layout";
import { PropertiesClient } from "@/components/property/PropertiesClient";
import Loading from "./loading";

// Cache the data fetcher
// Cache the data using Next.js unstable_cache (Data Cache)
// This enables caching across requests/users, unlike React cache which is per-request
const getProperties = unstable_cache(
  async (params: SearchPropertiesParams) => {
    try {
      return await propertiesService.getAll(params);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      return { data: [], meta: null };
    }
  },
  ["properties-search-results"], // Key parts
  {
    revalidate: 60, // Cache for 1 minute shared across all users
    tags: ["properties"], // Allows manual invalidation with revalidateTag('properties')
  }
);

interface PropertiesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  // Parse params
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q as string | undefined;
  const propertyType = (searchParams.type ||
    searchParams.propertyType) as string | undefined;
  const listingType = searchParams.listingType as string | undefined;
  const minPrice = searchParams.minPrice
    ? Number(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? Number(searchParams.maxPrice)
    : undefined;
  const bedrooms = searchParams.bedrooms
    ? Number(searchParams.bedrooms)
    : undefined;
  const province = searchParams.province as string | undefined;

  const filters = {
    q,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    province,
    page,
  };

  // Fetch data
  const { data: properties, meta } = await getProperties({
    limit: 12,
    ...filters,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <PropertiesClient
            initialProperties={properties}
            meta={meta}
            initialFilters={filters}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

