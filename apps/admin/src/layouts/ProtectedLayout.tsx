import { useSession } from "@/services/auth.service";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Type assertion since better-auth types might not fully infer custom fields in client immediately without generation
  const user = session.user as any;

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p>You do not have permission to access the admin area.</p>
        <p className="text-gray-500 text-sm mt-4">Current Role: {user.role}</p>
      </div>
    );
  }

  return <Outlet />;
}
