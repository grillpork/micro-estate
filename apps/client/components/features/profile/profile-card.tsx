import { cacheLife } from "next/cache";
import { User } from "@/types/user";
import { User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileCardProps {
  user: User;
  isMe?: boolean;
}

export async function ProfileCard({ user, isMe = false }: ProfileCardProps) {
  "use cache";
  cacheLife("minutes");

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">
          {isMe ? "Profile Overview" : `${user.name}'s Profile`}
        </CardTitle>
        <CardDescription>
          {isMe
            ? "This is a cached summary of your profile information."
            : `Viewing ${user.name}'s profile information.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage
              src={user.image}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/5 text-primary text-xl">
              {user.name?.charAt(0)?.toUpperCase() || (
                <UserIcon className="h-10 w-10" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {user.name}
            </h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
