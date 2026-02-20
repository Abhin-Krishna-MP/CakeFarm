import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/navbar/Navbar";
import FoodItemCard from "../../components/foodItemsCard/FoodItemCard";
import CartItems from "../../components/cartItems/CartItems";
import "./lunch.scss";

export default function Lunch() {
  const [lunchProducts, setLunchProducts] = useState([]);
  const [isOrderingOpen, setIsOrderingOpen] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState("");
  const [loading, setLoading] = useState(true);

  const { token } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  useEffect(() => {
    checkLunchStatus();
    fetchLunchProducts();
  }, []);

  const checkLunchStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URI}/lunch/status`
      );
      const data = await response.json();
      if (data.data) {
        setIsOrderingOpen(data.data.isOpen);
        setDeadlineTime(data.data.orderDeadlineTime);
      }
    } catch (error) {
      console.error("Error checking lunch status:", error);
    }
  };

  const fetchLunchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URI}/lunch/products`
      );
      const data = await response.json();
      if (data.data?.products) {
        setLunchProducts(data.data.products);
      }
    } catch (error) {
      console.error("Error fetching lunch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const convert24To12 = (time24) => {
    if (!time24 || !time24.includes(":")) return time24 || "--:--";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="lunch-page">
      <Navbar />
      
      <div className="lunch-container">
        <div className="lunch-header">
          <h1>🍱 Lunch Pre-Booking</h1>
          <div className="lunch-status">
            {isOrderingOpen ? (
              <div className="status-open">
                <span className="status-indicator open"></span>
                <div className="status-text">
                  <strong>Ordering Open</strong>
                  <small>Order before {convert24To12(deadlineTime)}</small>
                </div>
              </div>
            ) : (
              <div className="status-closed">
                <span className="status-indicator closed"></span>
                <div className="status-text">
                  <strong>Ordering Closed</strong>
                  <small>Deadline: {convert24To12(deadlineTime)}</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isOrderingOpen && (
          <div className="closed-notice">
            <h2>⏰ Lunch Ordering is Closed</h2>
            <p>
              The deadline for today's lunch orders has passed. Please order before{" "}
              <strong>{convert24To12(deadlineTime)}</strong> tomorrow.
            </p>
          </div>
        )}

        <div className="lunch-content">
          <div className="lunch-items-section">
            <h2>Today's Lunch Menu</h2>
            {loading ? (
              <div className="loading">Loading lunch menu...</div>
            ) : lunchProducts.length === 0 ? (
              <div className="no-items">
                <p>No lunch items available today.</p>
              </div>
            ) : (
              <div className="lunch-items-grid">
                {lunchProducts.map((item) => (
                  <FoodItemCard
                    key={item.productId}
                    item={item}
                    isDisabled={!isOrderingOpen}
                  />
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="lunch-cart-section">
              <CartItems />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
