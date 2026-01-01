import { getCachedPropertyBySlug } from "@/actions/property-cache";
import { PropertyDetail } from "@/components/features/property/PropertyDetail";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. SEO Metadata (Cached)
// Note: generateMetadata can await params directly as it doesn't block UI streaming
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getCachedPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found",
    };
  }

  return {
    title: `${property.title} | MicroEstate`,
    description:
      property.description?.slice(0, 160) || `Detail of ${property.title}`,
    openGraph: {
      images: property.images?.[0] ? [property.images[0]] : [],
    },
  };
}

// 2. Sub-component for fetching data (Suspended)
// This component awaits params and data, running inside Suspense
async function PropertyContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getCachedPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetail property={property} />;
}

// 3. Main Page Shell
// This is synchronous (or async without await) to render immediately
export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-4/3 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PropertyContent params={params} />
    </Suspense>
  );
}
