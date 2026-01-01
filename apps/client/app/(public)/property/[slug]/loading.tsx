import { ProfileSkeleton } from "@/components/features/user/profile-skeleton";

export default function Loading() {
  return (
    <div className="container py-10 px-4 md:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Property Details</h1>
      <ProfileSkeleton />
    </div>
  );
}
