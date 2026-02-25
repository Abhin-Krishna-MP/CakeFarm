import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setTicketDelivered, updateOrderStatusRealtime } from "../features/userActions/order/orderSlice";

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
    // Connect directly to the API server URL from the environment variable.
    // In dev this points to localhost:6005; in production it points to the
    // deployed API server. Using window.location.origin would break when the
    // client and API are hosted on different domains (no Vite proxy in prod).
    const socketUrl = import.meta.env.VITE_API_BASE_IMAGE_URI || (typeof window !== "undefined" ? window.location.origin : "");

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

    // Real-time order status changes from admin panel (placed → ready → delivered)
    socketRef.current.on("orderStatusUpdated", ({ orderStatusId, status }) => {
      // orderStatusId is the orderId on the server side (query param naming)
      dispatch(updateOrderStatusRealtime({ orderId: orderStatusId, status }));
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
