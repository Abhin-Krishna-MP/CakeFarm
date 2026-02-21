import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { LiaRupeeSignSolid, IoIosArrowDown, IoIosArrowUp } from "../../constants";
import "./orderTicket.scss";

/**
 * OrderTicket — movie-ticket / BookMyShow style
 *
 * Props:
 *   order   – single order object from Redux / API
 *   minimal – compact read-only mode (VerifyOrder page)
 */
const OrderTicket = ({ order, minimal = false }) => {
  const [expanded, setExpanded] = useState(false);

  // Torn state triggers when either:
  // 1. Admin scanned the QR and clicked "Mark as Delivered" (ticketStatus)
  // 2. Admin updated the order status to "delivered" via the admin panel (orderStatus)
  const normalizedStatus = (order.orderStatus || order.status || "").toLowerCase();
  const isDelivered =
    order.ticketStatus === "delivered" || normalizedStatus === "delivered";

  const statusLabel = order.orderStatus || order.status || "placed";
  const verifyUrl    = `${window.location.origin}/orders/verify/${order.orderToken}`;

  // Format pick-up time
  const pickupDate = order.pickUpTime
    ? new Date(Number(order.pickUpTime)).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short",
      })
    : "—";
  const pickupTime = order.pickUpTime
    ? new Date(Number(order.pickUpTime)).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  const itemNames = order.items?.map((i) => i.productName) || [];
  const headlineItems =
    itemNames.length <= 2
      ? itemNames.join(", ")
      : `${itemNames[0]}, ${itemNames[1]} +${itemNames.length - 2}`;

  return (
    <div
      className={`ot-wrapper${isDelivered ? " ot-torn" : ""}`}
      data-delivered={isDelivered}
    >

      {/* ══════════════ TOP HALF (white) ══════════════ */}
      <div className="ot-half ot-top">

        {/* Diagonal stripe border at the very top */}
        <div className="ot-stripe-bar" aria-hidden="true" />

        {/* Delivered stamp */}
        {isDelivered && (
          <div className="ot-stamp" aria-hidden="true">DELIVERED</div>
        )}

        {/* Order ID row */}
        <div className="ot-order-row">
          <span className="ot-order-label">Order</span>
          <span className="ot-order-num">#{order.orderNumber}</span>
          <span className={`ot-badge ot-badge--${statusLabel.toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>

        {/* Item headline */}
        <h2 className="ot-headline">{headlineItems || "—"}</h2>

        {/* Time / Date meta row */}
        <div className="ot-meta-row">
          <div className="ot-meta-cell">
            <span className="ot-meta-label">Time</span>
            <span className="ot-meta-val">{pickupTime}</span>
          </div>
          <div className="ot-meta-cell">
            <span className="ot-meta-label">Date</span>
            <span className="ot-meta-val">{pickupDate}</span>
          </div>
          <div className="ot-meta-cell ot-meta-cell--right">
            <span className="ot-meta-label">Items</span>
            <span className="ot-meta-val">{order.items?.length ?? 0}</span>
          </div>
        </div>

        {/* Collapsible items list */}
        {!minimal && (
          <button
            className="ot-items-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <span className="ot-items-preview">
              {order.items?.[0]?.productName || "Item"}
              {order.items?.length > 1 && (
                <em> +{order.items.length - 1} more</em>
              )}
            </span>
            {expanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        )}

        <AnimatePresence initial={false}>
          {(expanded || minimal) && (
            <motion.div
              key="items"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="ot-items-list"
            >
              {order.items?.map((item, i) => (
                <div key={i} className="ot-item-row">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${item.image}`}
                    alt={item.productName}
                    loading="lazy"
                  />
                  <span className="ot-item-name">{item.productName}</span>
                  <span className="ot-item-qty">×{item.quantity}</span>
                  <span className="ot-item-price">
                    <LiaRupeeSignSolid />
                    {item.price}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative barcode */}
        <div className="ot-barcode" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className={`ot-bar ot-bar--${
                i % 7 === 0 ? "w" : i % 5 === 0 ? "m" : "n"
              }`}
            />
          ))}
        </div>
        <p className="ot-serial">
          SERIAL · {order.orderToken
            ? order.orderToken.slice(0, 14).toUpperCase()
            : "—"}
        </p>
      </div>

      {/* ══════════════ TEAR ZONE (notches only) ══════════════ */}
      <div className="ot-tear-zone" aria-hidden="true">
        <div className="ot-notch ot-notch--left" />
        <div className="ot-notch ot-notch--right" />
      </div>

      {/* ══════════════ GAP — animates from 0 to 2rem when torn ══════════ */}
      <div className="ot-gap" aria-hidden="true" />

      {/* ══════════════ BOTTOM HALF (yellow) ══════════════ */}
      <div className="ot-half ot-bottom">
        <div className="ot-bottom-content">
          {/* Left: customer name + total */}
          <div className="ot-bottom-left">
            {order.user && (
              <>
                <span className="ot-b-label">Name</span>
                <span className="ot-b-val">{order.user.username || "—"}</span>
              </>
            )}
            <span className="ot-b-label" style={{ marginTop: order.user ? "0.65rem" : 0 }}>
              Price
            </span>
            <span className="ot-b-price">
              <LiaRupeeSignSolid />{order.total}
            </span>
          </div>

          {/* Right: QR code */}
          <div className="ot-bottom-right">
            {order.orderToken ? (
              <div className="ot-qr-wrap">
                <QRCodeSVG
                  value={verifyUrl}
                  size={90}
                  bgColor="#ffffff"
                  fgColor="#1A1A1A"
                  level="H"
                />
              </div>
            ) : (
              <p className="ot-no-token">Token N/A</p>
            )}
            <p className="ot-scan-hint">Scan to verify</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderTicket;
