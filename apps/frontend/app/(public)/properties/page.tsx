import { Suspense } from "react";
<<<<<<< HEAD
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

=======
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { getCachedProperties } from "@/actions/property-cache";
import { queryKeys } from "@/lib/query-keys";
import { PropertyListing } from "@/components/property/PropertyListing";
import type { SearchPropertiesParams } from "@/services";

const PropertyLoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="h-8 w-48 bg-muted rounded-full mb-8 animate-pulse" />
    <div className="h-12 w-full max-w-2xl bg-muted rounded-full mb-12 animate-pulse" />
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-3/4 rounded-[40px] bg-muted animate-pulse"
        />
      ))}
    </div>
  </div>
);

async function PropertyContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters: SearchPropertiesParams = {
    q: (params.q as string) || undefined,
    propertyType:
      (params.type as string) || (params.propertyType as string) || undefined,
    listingType: (params.listingType as string) || undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
    province: (params.province as string) || undefined,
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  };

  const queryClient = new QueryClient();

  // 1. Prefetch data using the CACHED Server Function
  await queryClient.prefetchQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: () => getCachedProperties(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PropertyListing />
    </HydrationBoundary>
  );
}

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <Suspense fallback={<PropertyLoadingSkeleton />}>
        <PropertyContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
