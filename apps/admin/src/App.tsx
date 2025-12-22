import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import { DashboardPage } from "@/pages/Dashboard";
import { VerificationsPage } from "@/pages/Verifications";
import { AmenitiesPage } from "@/pages/Amenities";
import { PropertiesPage } from "@/pages/Properties";
import { LoginPage } from "@/pages/Login";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "verifications",
            element: <VerificationsPage />,
          },
          {
            path: "amenities",
            element: <AmenitiesPage />,
          },
          {
            path: "properties",
            element: <PropertiesPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
