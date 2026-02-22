import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import "./orders.scss";
import {
  IoSearchSharp,
  RxCross2,
} from "../../constants";
import DropDown from "../../components/dropDown/DropDown";
import { motion, AnimatePresence } from "framer-motion";
import { slideIn } from "../../utils/motion";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../features/userActions/order/orderAction.js";
import OrderTicket from "../../components/orderTicket/OrderTicket";
import useOrderSocket from "../../hooks/useOrderSocket";

export default function Orders() {
  const [selectedValue, setSelectedValue] = useState("All");
  const [orderTab, setOrderTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const orderHistory = useSelector((state) => state.order.orderHistory);

  // Subscribe to real-time socket events so tickets tear without a reload
  useOrderSocket();

  useEffect(() => {
    dispatch(getOrderHistory(token));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedOrder]);

  const filteredOrders = orderHistory?.filter((order) => {
    if (orderTab === "lunch") {
      const isLunchOrder = order.items?.some((item) => item.isLunchItem === true);
      if (!isLunchOrder) return false;
    }
    if (selectedValue !== "All") {
      if (order.orderStatus?.toLowerCase() !== selectedValue.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = order.orderNumber?.toString().includes(q);
      const matchesItem = order.items?.some((item) =>
        item.productName?.toLowerCase().includes(q)
      );
      const matchesStatus = order.orderStatus?.toLowerCase().includes(q);
      if (!matchesId && !matchesItem && !matchesStatus) return false;
    }
    return true;
  });

  return (
    <div className="orders">
      <Navbar />
      <div className="orders-wrapper">
        <motion.div
          variants={slideIn("up", "spring", 0.2, 0.8)}
          initial="hidden"
          animate="show"
          className="orders-head"
        >
          <div className="orders-head-top">
            <h1>My Orders</h1>
            <div className="order-controls">
              <div className="order-tabs">
                <button className={orderTab === "all" ? "active" : ""} onClick={() => setOrderTab("all")}>
                  All
                </button>
                <button className={orderTab === "lunch" ? "active" : ""} onClick={() => setOrderTab("lunch")}>
                  🍱 Lunch
                </button>
              </div>
              <div className="selector">
                <DropDown
                  selectedValue={selectedValue}
                  setSelectedValue={setSelectedValue}
                  items={["All", "placed", "Delivered", "cancelled"]}
                />
              </div>
            </div>
          </div>
          <div className="order-search">
            <IoSearchSharp className="search-icon" />
            <input
              type="text"
              placeholder="Search by order #, item name, status…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <RxCross2 />
              </button>
            )}
          </div>
        </motion.div>

        <div className="order-summary">
          {filteredOrders?.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#a09cb8" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
              <p>No orders found</p>
            </div>
          )}
          {filteredOrders?.map((order, index) => (
            <div
              key={order.orderId || index}
              className="order-ticket-clickable"
              onClick={() => setSelectedOrder(order)}
            >
              <OrderTicket order={order} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Full-screen ticket modal ── */}
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
              {/* Close button — sits as a normal flex row, never clipped */}
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
              {/* Ticket — scrollable independently */}
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

