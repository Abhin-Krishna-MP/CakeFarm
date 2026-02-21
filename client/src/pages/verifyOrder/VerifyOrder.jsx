import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import OrderTicket from "../../components/orderTicket/OrderTicket";
import { slideIn } from "../../utils/motion";
import "./verifyOrder.scss";

/* ─────────────────────────────────────────────────────────────
   Toast helper (self-contained, no external library needed)
───────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => (
  <div className={`vo-toast vo-toast--${type}`} role="alert">
    <span>{message}</span>
    <button onClick={onClose} aria-label="close">×</button>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   VerifyOrder
   Route: /orders/verify/:token
   • Anyone can view the order state (public / no login required)
   • If the viewer is a logged-in admin, they also see "Mark as Delivered"
───────────────────────────────────────────────────────────── */
export default function VerifyOrder() {
  const { token } = useParams();
  const { userData, token: authToken } = useSelector((s) => s.auth);
  const isAdmin = userData?.role === "admin";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const socketRef = useRef(null);

  /* ── Fetch order ── */
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_BASE_URI}/users/order/verify/${token}`)
      .then((res) => {
        setOrder(res.data?.data?.order ?? null);
      })
      .catch(() => {
        setError("Order not found or the link is invalid.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  /* ── Socket: real-time delivered event ── */
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URI || "";
    let socketUrl;
    try {
      socketUrl = new URL(apiBase).origin;
    } catch {
      socketUrl = apiBase.replace(/\/api\/v1.*$/, "");
    }

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("orderDelivered", ({ orderToken }) => {
      setOrder((prev) => {
        if (!prev || prev.orderToken !== orderToken) return prev;
        return { ...prev, ticketStatus: "delivered" };
      });
    });

    return () => socketRef.current?.disconnect();
  }, []);

  /* ── Mark as delivered ── */
  const handleMarkDelivered = async () => {
    if (!order?.orderToken) return;
    setMarking(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URI}/admin/update-ticket-status`,
        { orderToken: order.orderToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      // Optimistic update before socket fires
      setOrder((prev) => ({ ...prev, ticketStatus: "delivered" }));
      setToast({ message: "✅ Order marked as delivered!", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update order.";
      setToast({ message: msg, type: "error" });
    } finally {
      setMarking(false);
    }
  };

  /* ── Render ── */
  if (loading) {
    return (
      <div className="vo-page">
        <div className="vo-center">
          <div className="vo-spinner" />
          <p>Loading order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="vo-page">
        <div className="vo-center">
          <div className="vo-error-icon">⚠️</div>
          <h2>Invalid Ticket</h2>
          <p>{error || "Could not load this order."}</p>
          <Link to="/" className="vo-home-link">Go to Home</Link>
        </div>
      </div>
    );
  }

  const alreadyDelivered = order.ticketStatus === "delivered";

  return (
    <div className="vo-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <motion.div
        className="vo-container"
        variants={slideIn("up", "spring", 0.1, 0.7)}
        initial="hidden"
        animate="show"
      >
        {/* ── Page header ── */}
        <div className="vo-header">
          <Link to="/" className="vo-back-link">← Back</Link>
          <h1>Order Ticket</h1>
          {order.user && (
            <p className="vo-customer-name">
              {order.user.username}
              {order.user.registerNumber && (
                <span> · {order.user.registerNumber}</span>
              )}
            </p>
          )}
        </div>

        {/* ── Ticket ── */}
        <OrderTicket order={order} minimal />

        {/* ── Admin controls ── */}
        {isAdmin && (
          <div className="vo-admin-panel">
            <p className="vo-admin-label">Admin Actions</p>
            {alreadyDelivered ? (
              <div className="vo-already-delivered">
                <span>✅</span>
                <span>This order was already marked as delivered.</span>
              </div>
            ) : (
              <button
                className="vo-deliver-btn"
                onClick={handleMarkDelivered}
                disabled={marking}
              >
                {marking ? (
                  <>
                    <span className="vo-btn-spinner" />
                    Updating…
                  </>
                ) : (
                  "✓ Mark as Delivered"
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Guest / user status view ── */}
        {!isAdmin && (
          <div className={`vo-status-chip vo-status-chip--${alreadyDelivered ? "delivered" : "active"}`}>
            {alreadyDelivered ? "🎉 Order Delivered" : "⏳ Order Active"}
          </div>
        )}
      </motion.div>
    </div>
  );
}
