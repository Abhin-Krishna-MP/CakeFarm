import React, { useContext, useEffect, useState } from "react";
import "./cartItems.scss";
import {
  GoDash,
  GoPlus,
  mealsImage,
  LiaRupeeSignSolid,
  MdCancel,
  FaArrowRight,
  RxCross2,
} from "../../constants";
import { motion } from "framer-motion";
import context from "../../context/context";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementItem,
  incrementItem,
  removeItemFromCart,
} from "../../features/userActions/cart/cartAction";
import { createOrder } from "../../features/userActions/order/orderAction";

const CartItem = ({ cartItem }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [itemQuantity, setItemQuantity] = useState(0);

  useEffect(() => {
    getCurrentQuantity(); // gets the current item quantity
  }, [cartItems]);

  const handleRemoveItem = () => {
    dispatch(removeItemFromCart(cartItem));
  };

  const getCurrentQuantity = () => {
    const matchItem = cartItems?.find(
      (item) => item.productId === cartItem.productId
    );
    setItemQuantity(matchItem?.quantity);
  };

  const handleItemIncrement = () => {
    dispatch(incrementItem(cartItem)); // increment item
  };

  const handleItemDecrement = () => {
    dispatch(decrementItem(cartItem)); // decrement item
  };

  return (
    <div className="cart-item">
      <div className="item-info">
        <img
          src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${
            cartItem.image
          }`}
          alt=""
        />
        <p>{cartItem.productName}</p>
      </div>
      <div className="cart-item-right">
        <div className="item-count">
          <motion.div
            className="icon-holder"
            whileTap={{ scale: 0.85 }}
            onClick={handleItemDecrement}
          >
            <GoDash className="icon-btn minus" />
          </motion.div>
          <span>{itemQuantity}</span>
          <motion.div
            className="icon-holder"
            whileTap={{ scale: 0.75 }}
            onClick={handleItemIncrement}
          >
            <GoPlus className="icon-btn plus" />
          </motion.div>
        </div>
        <div className="item-cost">
          <LiaRupeeSignSolid className="icon" />
          {cartItem.price}
        </div>
        <motion.div
          whileTap={{ scale: 0.75 }}
          className="item-cancel"
          onClick={handleRemoveItem}
        >
          <MdCancel />
        </motion.div>
      </div>
    </div>
  );
};

export default function CartItems() {
  const { setIsToggleCart } = useContext(context);

  // select the cart state
  const cart = useSelector((select) => select.cart);
  const { token } = useSelector((select) => select.auth);
  const dispatch = useDispatch();

  // Track lunch ordering status if any lunch items are in cart
  const [lunchOrderingOpen, setLunchOrderingOpen] = useState(true);
  const hasLunchItems = cart.cartItems?.some((item) => item.isLunchItem);

  useEffect(() => {
    if (!hasLunchItems) return;

    const checkLunchStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URI}/lunch/status`
        );
        const data = await res.json();
        if (data.data) setLunchOrderingOpen(data.data.isOpen);
      } catch (e) {}
    };

    checkLunchStatus();

    // Auto-close: set a timer to switch to closed at the deadline
    const scheduleAutoClose = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URI}/lunch/status`
        );
        const data = await res.json();
        if (data.data?.orderDeadlineTime) {
          const [hours, minutes] = data.data.orderDeadlineTime.split(":");
          const deadline = new Date();
          deadline.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          const ms = deadline - Date.now();
          if (ms > 0) {
            setTimeout(() => setLunchOrderingOpen(false), ms);
          }
        }
      } catch (e) {}
    };

    scheduleAutoClose();
  }, [hasLunchItems]);

  const handlePlaceOrder = () => {
    if (hasLunchItems && !lunchOrderingOpen) {
      alert(
        "Lunch ordering time has passed. Please remove lunch items from your cart before placing the order."
      );
      return;
    }
    if (cart.cartItems.length) {
      dispatch(createOrder(token, cart.cartItems));
    } else {
      alert("empty cart");
    }
  };

  return (
    <div className="cart-items">
      {/* Header */}
      <div className="cart-header">
        <h2>🛒 Your Cart {cart.cartItems.length > 0 && `(${cart.cartItems.length})`}</h2>
        <RxCross2 className="close-cart" onClick={() => setIsToggleCart(false)} />
      </div>

      {/* Items list */}
      <div className="cart-items-cont">
        {!cart.cartItems.length && <h1>Your cart is empty</h1>}
        {hasLunchItems && !lunchOrderingOpen && (
          <div className="lunch-closed-warning">
            ⏰ Lunch ordering time has passed. Remove lunch items to place an order.
          </div>
        )}
        {cart.cartItems?.map((cartItem, index) => (
          <CartItem key={index} cartItem={cartItem} />
        ))}
      </div>

      {/* Sticky checkout bar */}
      <div className="cart-bottom">
        {!!cart.cartItems.length && (
          <>
            <div className="cart-total-row">
              <p>
                <span>Total:</span>
                <LiaRupeeSignSolid className="icon" />
                {cart.totalCost}
              </p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={hasLunchItems && !lunchOrderingOpen}
            >
              Place Order
              <FaArrowRight className="icon" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
