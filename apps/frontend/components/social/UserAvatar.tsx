import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
      <AvatarFallback>
        {user.name?.slice(0, 2).toUpperCase() || "UN"}
      </AvatarFallback>
    </Avatar>
  );
}
