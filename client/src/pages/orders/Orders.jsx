import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import "./orders.scss";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  LiaRupeeSignSolid,
  HiHome,
  mealsImage,
} from "../../constants";
import DropDown from "../../components/dropDown/DropDown";
import { motion } from "framer-motion";
import { slideIn } from "../../utils/motion";
import { Link } from "react-router-dom";
import OutsideClickHandler from "react-outside-click-handler";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../features/userActions/order/orderAction.js";
import OrderTicket from "../../components/orderTicket/OrderTicket";
import useOrderSocket from "../../hooks/useOrderSocket";

export default function Orders() {
  const [selectedValue, setSelectedValue] = useState("All");
  const [orderTab, setOrderTab] = useState("all"); // "all" or "lunch"

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const orderHistory = useSelector((state) => state.order.orderHistory);

  // Subscribe to real-time socket events so tickets tear without a reload
  useOrderSocket();

  useEffect(() => {
    dispatch(getOrderHistory(token));
  }, []);

  // Filter orders based on tab selection
  const filteredOrders = orderHistory?.filter((order) => {
    // Filter by lunch tab
    if (orderTab === "lunch") {
      const isLunchOrder = order.items?.some((item) => item.isLunchItem === true);
      if (!isLunchOrder) return false;
    }
    // Filter by status dropdown
    if (selectedValue !== "All") {
      if (order.orderStatus?.toLowerCase() !== selectedValue.toLowerCase()) return false;
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
        </motion.div>
        <div className="order-summary">
          {filteredOrders?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#a09cb8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>No orders found</p>
            </div>
          )}
          {filteredOrders?.map((order, index) => (
            <OrderTicket key={order.orderId || index} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

