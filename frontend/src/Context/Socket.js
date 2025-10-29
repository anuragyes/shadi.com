import { io } from "socket.io-client";

const SOCKET_URL = "https://shadii-com.onrender.com"; // your backend URL

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
