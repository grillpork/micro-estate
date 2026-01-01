<<<<<<< HEAD
import { Skeleton } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="mt-2 h-5 w-32" />
                </div>

                {/* Search & Filters Bar Skeleton */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
                            <Skeleton className="aspect-4/3 w-full rounded-t-xl" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-1/3" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
=======
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <main className="container mx-auto px-4 py-12">
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-12 w-64 md:w-96 rounded-lg" />
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>

          <div className="flex bg-white dark:bg-zinc-900 rounded-full p-1.5 border border-border/40 shadow-sm w-fit">
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="mb-10 sticky top-24 z-30">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-3xl md:rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/40 shadow-xl">
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        {/* Property Grid Skeleton */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-full rounded-[40px] overflow-hidden border border-border/40 bg-white dark:bg-zinc-900"
            >
              <Skeleton className="aspect-4/5 w-full" />
              <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
>>>>>>> 3f33e72 (feat: Add new UI components, chat features, and services, while updating admin layout, backend user service, and frontend pages.)
}
