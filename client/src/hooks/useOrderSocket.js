import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setTicketDelivered } from "../features/userActions/order/orderSlice";

/**
 * Connects to the Socket.io server and listens for real-time
 * "orderDelivered" events.  When one arrives it dispatches
 * setTicketDelivered so any mounted ticket flips to the torn state
 * without a page refresh.
 *
 * Pass an optional `onDelivered` callback for page-local side effects
 * (e.g. VerifyOrder page re-renders the inline ticket view).
 */
const useOrderSocket = (onDelivered = null) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to the same origin as the page — Vite dev server proxies
    // /socket.io/ to the API server (ws: true in vite.config.js).
    // This avoids cross-origin WebSocket failures and React StrictMode
    // double-invoke teardowns before the WS handshake completes.
    const socketUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("orderDelivered", ({ orderToken }) => {
      // Update Redux so every mounted OrderTicket with this token tears
      dispatch(setTicketDelivered(orderToken));
      // Allow callers to handle local state changes too
      if (typeof onDelivered === "function") {
        onDelivered(orderToken);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
    // onDelivered intentionally omitted – callers pass a stable ref or
    // accept a one-time registration on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
};

export default useOrderSocket;
