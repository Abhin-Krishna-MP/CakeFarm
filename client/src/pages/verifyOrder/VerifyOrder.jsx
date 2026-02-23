import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { io } from "socket.io-client";
import OrderTicket from "../../components/orderTicket/OrderTicket";
import { slideIn } from "../../utils/motion";
import { FaArrowRight } from "../../constants";
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
   Slide-to-Deliver — admin confirmation slider
   Same pattern as cart's SlideToOrder, green theme
───────────────────────────────────────────────────────────── */
const SlideToDeliver = ({ onConfirm, alreadyDone }) => {
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const THUMB = 56;
  const PAD   = 5;

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
  }, []);

  const maxTravel     = trackWidth - THUMB - PAD * 2;
  const shimmerOpacity = useTransform(x, [0, maxTravel * 0.5], [1, 0]);
  const labelOpacity   = useTransform(x, [0, maxTravel * 0.45], [1, 0]);
  const fillWidth      = useTransform(x, [0, maxTravel], ["0%", "100%"]);

  const handleDragEnd = (_, info) => {
    if (!trackRef.current) return;
    if (info.offset.x >= maxTravel * 0.78) {
      animate(x, maxTravel, { duration: 0.06 });
      setConfirmed(true);
      setTimeout(() => {
        onConfirm();
        animate(x, 0, { duration: 0.5, type: "spring", stiffness: 120, damping: 18 });
        setConfirmed(false);
      }, 600);
    } else {
      animate(x, 0, { duration: 0.4, type: "spring", stiffness: 200, damping: 22 });
    }
  };

  if (alreadyDone) {
    return (
      <div className="vo-delivered-badge">
        <span className="vo-delivered-icon">✓</span>
        <span>Ticket Delivered</span>
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={`vo-slide-deliver${confirmed ? " confirmed" : ""}`}
    >
      {/* Green progress fill */}
      <motion.div className="vsd-fill" style={{ width: fillWidth }} />

      {/* Shimmer sweep */}
      <motion.div className="vsd-shimmer" style={{ opacity: shimmerOpacity }} />

      {/* Label */}
      <motion.span className="vsd-label" style={{ opacity: labelOpacity }}>
        {confirmed ? "✓  Delivered!" : "Slide to mark delivered"}
      </motion.span>

      {/* Draggable thumb */}
      <motion.div
        className="vsd-thumb"
        drag="x"
        dragConstraints={trackRef}
        dragMomentum={false}
        dragElastic={0}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.12 }}
        whileTap={{ scale: 1.05 }}
      >
        <motion.div className="vsd-thumb-inner">
          {confirmed
            ? <span className="vsd-check">✓</span>
            : <FaArrowRight className="vsd-arrow" />}
        </motion.div>
      </motion.div>
    </div>
  );
};

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
        <OrderTicket order={order} minimal={false} />

        {/* ── Admin controls ── */}
        {isAdmin && (
          <div className="vo-admin-panel">
            <div className="vo-admin-header">
              <span className="vo-admin-icon">🛡</span>
              <span className="vo-admin-label">Admin · Mark as Delivered</span>
            </div>
            <SlideToDeliver
              onConfirm={handleMarkDelivered}
              alreadyDone={alreadyDelivered}
            />
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
