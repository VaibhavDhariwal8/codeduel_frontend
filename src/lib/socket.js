import { io } from "socket.io-client";

let socket;

export function getSocket(accessToken) {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: accessToken,
      },
    });
  }

  return socket;
}
