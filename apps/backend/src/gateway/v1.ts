import { Hono } from "hono";

// Import all module routes
import { authRoutes } from "@/modules/auth";
import { usersRoutes } from "@/modules/users";
import { propertiesRoutes } from "@/modules/properties";
import { searchRoutes } from "@/modules/search";
import { mediaRoutes } from "@/modules/media";
import { chatRoutes } from "@/modules/chat";
import { notificationsRoutes } from "@/modules/notifications";
import { favoritesRoutes } from "@/modules/favorites";
import { verificationRoutes } from "@/modules/verification";
import { amenitiesRoutes } from "@/modules/amenities";
import { paymentRoutes, webhookRoutes } from "@/modules/payments";
import { demandsRoutes } from "@/modules/demands";
import { bookingsRoutes } from "@/modules/bookings";
import { dashboardRoutes } from "@/modules/dashboard";
import { homeRoutes } from "@/modules/home";
import { socialRoutes } from "@/modules/social/social.routes";
import { shortsRoutes } from "@/modules/shorts/shorts.routes";

const v1 = new Hono();

// ===== Mount All Routes =====
v1.route("/auth", authRoutes);
v1.route("/users", usersRoutes);
v1.route("/properties", propertiesRoutes);
v1.route("/search", searchRoutes);
v1.route("/media", mediaRoutes);
v1.route("/chat", chatRoutes);
v1.route("/notifications", notificationsRoutes);
v1.route("/favorites", favoritesRoutes);
v1.route("/verification", verificationRoutes);
v1.route("/amenities", amenitiesRoutes);
v1.route("/payments", paymentRoutes);
v1.route("/webhooks", webhookRoutes);
v1.route("/demands", demandsRoutes);
v1.route("/bookings", bookingsRoutes);
v1.route("/dashboard", dashboardRoutes);

v1.route("/home", homeRoutes);
v1.route("/social", socialRoutes);
v1.route("/shorts", shortsRoutes);

export default v1;
