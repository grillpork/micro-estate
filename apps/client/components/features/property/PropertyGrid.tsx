"use client";

import { useProperties } from "@/hooks/queries/use-properties";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Property } from "@/types/property";

export const PropertyGrid = () => {
  const searchParams = useSearchParams();

  // Extract Filters from URL
  const filters = {
    limit: 12, // Default limit
    page: Number(searchParams.get("page")) || 1,
    q: searchParams.get("q") || undefined,
    // Add other filters here
  };

  const { data, isLoading, isError } = useProperties(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[300px] bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Failed to load properties
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="text-gray-500 text-center py-10">No properties found</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.data.map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.slug || property.id}`}
            prefetch={false}
            className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
              {/* Use placeholder if no image */}
              <div className="absolute inset-0 bg-gray-200 animate-pulse group-hover:scale-105 transition-transform duration-500" />
              <Image
                src={
                  property.thumbnailUrl ||
                  (typeof property.images?.[0] === "object"
                    ? (property.images[0] as any).url
                    : property.images?.[0]) ||
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop"
                }
                alt={property.title}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                For Sale
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(property.price)}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1">🛏️ 3 Beds</span>
                <span className="flex items-center gap-1">🚿 2 Baths</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Basic Pagination Handling */}
      <div className="flex justify-center gap-2 mt-8">
        <button
          disabled={data.page === 1}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-600">
          Page {data.page} of {Math.ceil(data.total / data.limit)}
        </span>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
};
