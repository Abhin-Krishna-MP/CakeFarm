import React, { useContext, useEffect, useState, useRef } from "react";
import "./cartItems.scss";
import {
  GoDash,
  GoPlus,
  LiaRupeeSignSolid,
  MdCancel,
  FaArrowRight,
  RxCross2,
} from "../../constants";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import context from "../../context/context";

/* Stagger container for cart items list */
const cartListVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

/* Per-item entry animation (used with stagger parent) */
const cartItemEntryVar = {
  hidden: { opacity: 0, y: 22, scale: 0.94 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};
import { useDispatch, useSelector } from "react-redux";
import {
  decrementItem,
  incrementItem,
  removeItemFromCart,
} from "../../features/userActions/cart/cartAction";
import { createOrder } from "../../features/userActions/order/orderAction";

/* ─── Slide-to-confirm order button ─── */
const SlideToOrder = ({ onConfirm, disabled }) => {
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const THUMB = 56;
  const PAD = 5;

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
  }, []);

  const maxTravel = trackWidth - THUMB - PAD * 2;
  // shimmer opacity fades as user drags right
  const shimmerOpacity = useTransform(x, [0, maxTravel * 0.5], [1, 0]);
  // label opacity fades as thumb approaches end
  const labelOpacity = useTransform(x, [0, maxTravel * 0.45], [1, 0]);
  // progress fill width
  const fillWidth = useTransform(x, [0, maxTravel], ['0%', '100%']);

  const handleDragEnd = (_, info) => {
    if (!trackRef.current) return;
    if (info.offset.x >= maxTravel * 0.78) {
      animate(x, maxTravel, { duration: 0.06 });
      setConfirmed(true);
      setTimeout(() => {
        onConfirm();
        animate(x, 0, { duration: 0.5, type: 'spring', stiffness: 120, damping: 18 });
        setConfirmed(false);
      }, 600);
    } else {
      animate(x, 0, { duration: 0.4, type: 'spring', stiffness: 200, damping: 22 });
    }
  };

  return (
    <div
      ref={trackRef}
      className={`slide-to-order${disabled ? ' disabled' : ''}${confirmed ? ' confirmed' : ''}`}
    >
      {/* Progress fill */}
      <motion.div className="slide-fill" style={{ width: fillWidth }} />

      {/* Shimmer sweep */}
      <motion.div className="slide-shimmer" style={{ opacity: shimmerOpacity }} />

      {/* Label */}
      <motion.span className="slide-label" style={{ opacity: labelOpacity }}>
        {confirmed ? '✓ Confirmed!' : 'Slide to place order'}
      </motion.span>

      {/* Thumb */}
      <motion.div
        className="slide-thumb"
        drag={disabled ? false : 'x'}
        dragConstraints={trackRef}
        dragMomentum={false}
        dragElastic={0}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.12 }}
        whileTap={{ scale: 1.05 }}
      >
        <motion.div
          animate={confirmed ? { rotate: 0 } : {}}
          className="thumb-inner"
        >
          {confirmed
            ? <span className="check">✓</span>
            : <FaArrowRight className="icon" />}
        </motion.div>
      </motion.div>
    </div>
  );
};

const CartItem = ({ cartItem }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [itemQuantity, setItemQuantity] = useState(0);

  useEffect(() => { getCurrentQuantity(); }, [cartItems]);

  const getCurrentQuantity = () => {
    const matchItem = cartItems?.find((item) => item.productId === cartItem.productId);
    setItemQuantity(matchItem?.quantity || 0);
  };

  return (
    <motion.div
      className="cart-item"
      variants={cartItemEntryVar}
      layout
      exit={{ opacity: 0, x: 56, scale: 0.9, transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="cart-item-img">
        <img
          src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${cartItem.image}`}
          alt={cartItem.productName}
        />
      </div>

      {/* Info */}
      <div className="cart-item-body">
        <p className="cart-item-name">{cartItem.productName}</p>
        <div className="cart-item-meta">
          <span className="unit-price">
            <LiaRupeeSignSolid className="rp" />
            {cartItem.price} each
          </span>
        </div>

        {/* Controls row */}
        <div className="cart-item-controls">
          <div className="qty-pill">
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => dispatch(decrementItem(cartItem))}>
              <GoDash />
            </motion.button>
            <span>{itemQuantity}</span>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => dispatch(incrementItem(cartItem))}>
              <GoPlus />
            </motion.button>
          </div>

          <span className="line-total">
            <LiaRupeeSignSolid className="rp" />
            {(cartItem.price * itemQuantity).toFixed(0)}
          </span>

          <motion.button
            className="remove-btn"
            whileTap={{ scale: 0.75 }}
            onClick={() => dispatch(removeItemFromCart(cartItem))}
          >
            <MdCancel />
          </motion.button>
        </div>
      </div>
    </motion.div>
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
      {/* ─── Mobile drag handle ─── */}
      <div className="drag-handle-wrap">
        <div className="drag-handle" />
      </div>

      {/* ─── Header ─── */}
      <div className="cart-header">
        <div className="cart-header-left">
          <span className="cart-icon-badge">🛒</span>
          <div>
            <h2>Your Cart</h2>
            {cart.cartItems.length > 0 && (
              <p className="cart-sub">{cart.cartItems.length} item{cart.cartItems.length > 1 ? 's' : ''} · ₹{cart.totalCost}</p>
            )}
          </div>
        </div>
        <motion.button
          className="close-cart"
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsToggleCart(false)}
        >
          <RxCross2 />
        </motion.button>
      </div>

      {/* ─── Items list ─── */}
      <motion.div
        className="cart-items-cont"
        variants={cartListVars}
        initial="hidden"
        animate="show"
      >
        {!cart.cartItems.length && (
          <div className="empty-cart">
            <div className="empty-icon">🛍️</div>
            <h3>Nothing here yet</h3>
            <p>Add some delicious items from the menu</p>
          </div>
        )}
        {hasLunchItems && !lunchOrderingOpen && (
          <div className="lunch-closed-warning">
            <span>⏰</span>
            <p>Lunch ordering has closed. Remove lunch items to place an order.</p>
          </div>
        )}
        <AnimatePresence>
          {cart.cartItems?.map((cartItem, index) => (
            <CartItem key={cartItem.productId || index} cartItem={cartItem} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ─── Checkout Panel ─── */}
      {!!cart.cartItems.length && (
        <div className="cart-bottom">
          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="val">₹{cart.totalCost}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="val free">FREE</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span className="val">₹{cart.totalCost}</span>
            </div>
          </div>

          {/* Slide to order */}
          <SlideToOrder
            onConfirm={handlePlaceOrder}
            disabled={hasLunchItems && !lunchOrderingOpen}
          />

          <p className="secure-note">🔒 Secure checkout · No hidden charges</p>
        </div>
      )}
    </div>
  );
}
