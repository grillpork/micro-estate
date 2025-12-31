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
}
