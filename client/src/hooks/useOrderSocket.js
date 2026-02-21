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
    // Derive the socket server root from the API base URL.
    // VITE_API_BASE_URI is something like "http://host:port/api/v1"
    const apiBase = import.meta.env.VITE_API_BASE_URI || "";
    let socketUrl;
    try {
      socketUrl = new URL(apiBase).origin; // "http://host:port"
    } catch {
      socketUrl = apiBase.replace(/\/api\/v1.*$/, "");
    }

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
