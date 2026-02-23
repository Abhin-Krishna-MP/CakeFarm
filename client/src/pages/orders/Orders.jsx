import React, { useContext, useEffect, useMemo, useState } from "react";
import context from "../../context/context";
import Navbar from "../../components/navbar/Navbar";
import "./orders.scss";
import { RxCross2 } from "../../constants";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../features/userActions/order/orderAction.js";
import OrderTicket from "../../components/orderTicket/OrderTicket";
import useOrderSocket from "../../hooks/useOrderSocket";

const STATUS_FILTERS = ["all", "placed", "ready", "delivered", "cancelled"];

const STATUS_COLORS = {
  placed:    { bg: "rgba(59,130,246,0.12)",  color: "#2563eb" },
  ready:     { bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  delivered: { bg: "rgba(34,197,94,0.12)",   color: "#16a34a" },
  cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
};

export default function Orders() {
  const [orderTab,      setOrderTab]      = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { navSearch, setNavSearch } = useContext(context);

  const dispatch = useDispatch();
  const { token }      = useSelector((s) => s.auth);
  const orderHistory   = useSelector((s) => s.order.orderHistory);

  useOrderSocket();

  useEffect(() => { dispatch(getOrderHistory(token)); }, []);

  useEffect(() => {
    document.body.style.overflow = selectedOrder ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedOrder]);

  /* ─── Filtered list ─── */
  const filteredOrders = useMemo(() => {
    return (orderHistory || []).filter((order) => {
      if (orderTab === "lunch") {
        if (!order.items?.some((i) => i.isLunchItem === true)) return false;
      }
      if (statusFilter !== "all") {
        if (order.orderStatus?.toLowerCase() !== statusFilter) return false;
      }
      if (navSearch.trim()) {
        const q = navSearch.toLowerCase();
        const okId     = order.orderNumber?.toString().includes(q);
        const okItem   = order.items?.some((i) => i.productName?.toLowerCase().includes(q));
        const okStatus = order.orderStatus?.toLowerCase().includes(q);
        if (!okId && !okItem && !okStatus) return false;
      }
      return true;
    });
  }, [orderHistory, orderTab, statusFilter, navSearch]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const all = orderHistory || [];
    return {
      total:     all.length,
      placed:    all.filter((o) => o.orderStatus?.toLowerCase() === "placed").length,
      delivered: all.filter((o) => o.orderStatus?.toLowerCase() === "delivered").length,
      cancelled: all.filter((o) => o.orderStatus?.toLowerCase() === "cancelled").length,
    };
  }, [orderHistory]);

  return (
    <div className="orders-page">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="orders-hero">
        <div className="hero-orbs" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <div className="hero-inner">
          <div className="hero-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            Order History
          </div>

          <h1 className="hero-title">My Orders</h1>
          <p className="hero-sub">Track, review and manage all your food orders in one place</p>

          {stats.total > 0 && (
            <div className="hero-stats">
              <span className="stat">{stats.total} <em>total</em></span>
              <span className="divider" />
              <span className="stat placed">{stats.placed} <em>placed</em></span>
              <span className="divider" />
              <span className="stat delivered">{stats.delivered} <em>delivered</em></span>
              <span className="divider" />
              <span className="stat cancelled">{stats.cancelled} <em>cancelled</em></span>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <div className="orders-container">

        {/* ─── Toolbar ─── */}
        <div className="toolbar">
          {/* Type tabs */}
          <div className="type-pills" role="group" aria-label="Order type">
            <button
              className={`pill ${orderTab === "all" ? "active" : ""}`}
              onClick={() => setOrderTab("all")}
            >All Orders</button>
            <button
              className={`pill lunch ${orderTab === "lunch" ? "active" : ""}`}
              onClick={() => setOrderTab("lunch")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
              </svg>
              Lunch
            </button>
          </div>
        </div>

        {/* ─── Status pills ─── */}
        <div className="status-pills" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`status-pill ${s} ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── Result count ─── */}
        <p className="result-count">
          {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
        </p>

        {/* ─── Empty state ─── */}
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <h3>{(orderHistory || []).length === 0 ? "No orders yet" : "No orders match"}</h3>
            <p>
              {(orderHistory || []).length === 0
                ? "Start ordering and your history will appear here."
                : "Try adjusting your search or filters."}
            </p>
              {(navSearch || orderTab !== "all" || statusFilter !== "all") && (
              <button
                className="reset-btn"
                onClick={() => { setNavSearch(""); setOrderTab("all"); setStatusFilter("all"); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ─── Orders list ─── */}
        {filteredOrders.length > 0 && (
          <div className="orders-list">
            {filteredOrders.map((order, i) => (
              <div
                key={order.orderId || i}
                className="order-card-anim"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => setSelectedOrder(order)}
              >
                <OrderTicket order={order} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="order-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="order-modal-content"
              initial={{ scale: 0.82, opacity: 0, y: 48 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.82, opacity: 0, y: 48 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="order-modal-close-row">
                <motion.button
                  className="order-modal-close"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <motion.span
                    className="omc-icon"
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <RxCross2 />
                  </motion.span>
                  <span className="omc-label">close</span>
                </motion.button>
              </div>
              <div className="order-modal-scroll">
                <OrderTicket order={selectedOrder} minimal={true} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

