import { Suspense } from "react";
import { ProfileContent } from "@/components/features/profile/profile-content";
import { ProfileSkeleton } from "@/components/features/user/profile-skeleton";

export default function ProfilePage() {
  return (
    <div className="container py-10 px-4 md:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
