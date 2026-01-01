import { Suspense } from "react";
import { getCachedUserById } from "@/actions/user-cache";
import { ProfileSkeleton } from "@/components/features/user/profile-skeleton";
import { ProfileCard } from "../../../../components/features/profile/profile-card";
import { notFound } from "next/navigation";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;

  return (
    <div className="container py-10 px-4 md:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">User Profile</h1>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContentWrapper id={id} />
      </Suspense>
    </div>
  );
}

async function ProfileContentWrapper({ id }: { id: string }) {
  try {
    const user = await getCachedUserById(id);
    if (!user) return notFound();

    return (
      <div className="space-y-8">
        <ProfileCard user={user} />

        {/* You could add more sections here like their listings, etc. */}
        <div className="bg-zinc-900/50 rounded-xl p-8 text-center text-zinc-500 border border-zinc-800">
          <p>This user hasn't posted any properties yet.</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch public profile:", error);
    return notFound();
  }
}
