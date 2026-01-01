import { getMyProfile } from "@/actions/user-cache";
import { ProfileCard } from "./profile-card";
import { ProfileForm } from "@/components/features/user/profile-form";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export async function ProfileContent() {
  const user = await getMyProfile();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-12">
      <ProfileCard user={user} isMe={true} />
      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
