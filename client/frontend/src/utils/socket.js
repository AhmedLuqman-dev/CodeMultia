import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export function normalizeRoomUsers(payload) {
  if (!Array.isArray(payload)) return [];
  return payload.map((entry, index) => {
    if (typeof entry === "string") {
      return { id: `legacy-${index}-${entry}`, name: entry };
    }
    return {
      id: entry.id || `user-${index}`,
      name: entry.name || "Anonymous",
    };
  });
}
