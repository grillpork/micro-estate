/**
 * Hooks - Central Export Point
 * All custom hooks are exported from here
 */

// WebSocket hook for realtime chat
export { useWebSocket } from "./useWebSocket";

// Media query hooks
export {
  useMediaQuery,
  useIsMobile,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from "./useMediaQuery";
