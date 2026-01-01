import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { getCachedProperties } from "@/actions/property-cache";
import { queryKeys } from "@/lib/query-keys";
import { PropertyGrid } from "./PropertyGrid";

export default async function Properties({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const limit = 12;

  const queryClient = new QueryClient();

  // 1. Prefetch data using the CACHED Server Function
  // Next.js will cache this result, so repetitive page loads are super fast
  await queryClient.prefetchQuery({
    queryKey: queryKeys.properties.list({ page, limit }),
    queryFn: () => getCachedProperties({ page, limit }),
  });

  return (
    // 2. Hydrate the state to the client
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Featured Properties
          </h1>
          <p className="text-gray-500 mt-2">
            Find your dream home from our exclusive listings
          </p>
        </header>

        {/* 3. Client Component will pick up the hydrated data instantly */}
        <PropertyGrid />
      </main>
    </HydrationBoundary>
  );
}
