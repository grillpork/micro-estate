import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { socketService } from "@/lib/socket";

export const useSocketInit = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // Connect specifically when user is authenticated
      // Assuming 'token' is available in session or managed via cookies (which socket.io can handle if domains match)
      // Note: If using cookies, token param might not be needed if WS server reads cookies.
      // But passing token is safer for cross-domain.
      // Better-auth usually manages session via cookies.
      socketService.connect("auto-handled-by-cookie");
    } else {
      socketService.disconnect();
    }

    return () => {
      // socketService.disconnect(); // Optional: Keep connection alive or disconnect on unmount
    };
  }, [session]);
};
