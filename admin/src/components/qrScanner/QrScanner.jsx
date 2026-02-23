import React, { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import { BsCurrencyRupee, TfiTime } from "../../constants/index";
import "./qrScanner.scss";

/* ─────────────────────────────────────────────────────────────
   Slide-to-Deliver  (same drag-confirm pattern as client app)
───────────────────────────────────────────────────────────── */
const SlideToDeliver = ({ onConfirm, alreadyDone }) => {
  const trackRef = useRef(null);
  const x        = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [confirmed, setConfirmed]   = useState(false);
  const THUMB = 56, PAD = 5;

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
  }, []);

  const maxTravel      = trackWidth - THUMB - PAD * 2;
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
      <div className="qs-delivered-badge">
        <span className="qs-delivered-icon">✓</span>
        <span>Already Delivered</span>
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={`qs-slide-deliver${confirmed ? " confirmed" : ""}`}
    >
      <motion.div className="qs-fill"    style={{ width: fillWidth }} />
      <motion.div className="qs-shimmer" style={{ opacity: shimmerOpacity }} />
      <motion.span className="qs-label"  style={{ opacity: labelOpacity }}>
        {confirmed ? "✓  Delivered!" : "Slide to mark as delivered"}
      </motion.span>
      <motion.div
        className="qs-thumb"
        drag="x"
        dragConstraints={trackRef}
        dragMomentum={false}
        dragElastic={0}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.12 }}
        whileTap={{ scale: 1.05 }}
      >
        <div className="qs-thumb-inner">
          {confirmed
            ? <span className="qs-check">✓</span>
            : <span className="qs-arrow">→</span>}
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   OrderCard — displays scanned order details
───────────────────────────────────────────────────────────── */
const OrderCard = ({ order, onMarkDelivered, marking, toast, onScanAgain }) => {
  const isDelivered =
    order.ticketStatus === "delivered" ||
    (order.orderStatus || "").toLowerCase() === "delivered";

  const statusLabel = order.orderStatus || order.status || "placed";
  const pickupDate  = order.pickUpTime
    ? new Date(Number(order.pickUpTime)).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short",
      })
    : "—";

  const initials = (order.user?.username || "?").slice(0, 2).toUpperCase();

  return (
    <motion.div
      className={`qs-order-card${isDelivered ? " qs-order-card--delivered" : ""}`}
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      {/* ── Top accent bar ── */}
      <div className="qs-card-accent" />

      {/* ── Header ── */}
      <div className="qs-card-header">
        <div className="qs-order-pill">
          <span className="qs-order-hash">#</span>
          <span className="qs-order-num">{order.orderNumber}</span>
          <span className={`qs-badge qs-badge--${statusLabel.toLowerCase()}`}>{statusLabel}</span>
        </div>
        <button className="qs-scan-again" onClick={onScanAgain}>
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>
          Scan Again
        </button>
      </div>

      {/* ── Customer hero ── */}
      {order.user && (
        <div className="qs-customer-hero">
          <div className="qs-avatar">{initials}</div>
          <div className="qs-customer-info">
            <p className="qs-customer-name">{order.user.username || "—"}</p>
            {order.user.registerNumber && (
              <p className="qs-customer-reg">{order.user.registerNumber}</p>
            )}
          </div>
          {order.user.department && (
            <span className="qs-dept-chip">{order.user.department}</span>
          )}
        </div>
      )}

      {/* ── Meta grid ── */}
      <div className="qs-meta-grid">
        <div className="qs-meta-cell">
          <span className="qs-meta-label">Date</span>
          <span className="qs-meta-val">{pickupDate}</span>
        </div>
        {order.user?.semester && order.user?.division && (
          <div className="qs-meta-cell">
            <span className="qs-meta-label">Sem / Div</span>
            <span className="qs-meta-val">{order.user.semester} · {order.user.division}</span>
          </div>
        )}
        <div className="qs-meta-cell">
          <span className="qs-meta-label">Items</span>
          <span className="qs-meta-val">{order.items?.length ?? 0}</span>
        </div>
      </div>

      {/* ── Items ── */}
      <div className="qs-items">
        <p className="qs-items-heading">
          <span className="qs-items-dot" />
          Order Items
        </p>
        {order.items?.map((item, i) => (
          <motion.div
            key={i}
            className="qs-item-row"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <img
              src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${item.image}`}
              alt={item.productName}
              loading="lazy"
            />
            <span className="qs-item-name">{item.productName}</span>
            <span className="qs-item-qty">×{item.quantity}</span>
            <span className="qs-item-price">
              <BsCurrencyRupee className="rp-icon" />{item.price}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Total ── */}
      <div className="qs-total-row">
        <span className="qs-total-label">Total Amount</span>
        <span className="qs-total-val">
          <BsCurrencyRupee className="rp-icon" />{order.total}
        </span>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className={`qs-toast qs-toast--${toast.type}`}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <span className="qs-toast-dot" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slide to deliver ── */}
      <div className="qs-deliver-section">
        <p className="qs-deliver-label">Admin Action</p>
        <SlideToDeliver onConfirm={onMarkDelivered} alreadyDone={isDelivered} />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   QrScanner — main component
   Uses getUserMedia + jsQR (raw canvas, no library UI overhead)
───────────────────────────────────────────────────────────── */
export default function QrScanner() {
  const { token: authToken } = useSelector((s) => s.auth);

  // phase: "idle" | "starting" | "scanning" | "loading" | "order" | "error"
  const [phase,    setPhase]    = useState("idle");
  const [order,    setOrder]    = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [marking,  setMarking]  = useState(false);
  const [toast,    setToast]    = useState(null);

  const videoRef   = useRef(null);   // hidden decode video
  const visVideoRef = useRef(null);  // visible viewfinder video
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const activeRef  = useRef(false);  // guard against updates after unmount/phase-change

  /* ── Stop everything ── */
  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (visVideoRef.current) visVideoRef.current.srcObject = null;
    if (videoRef.current)    videoRef.current.srcObject    = null;
  }, []);

  /* ── Scan loop ── */
  const startScanLoop = useCallback((onFound) => {
    const tick = () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !activeRef.current) return;

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w > 0 && h > 0) {
          canvas.width  = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, w, h);
          const img  = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (code?.data) { onFound(code.data); return; }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    activeRef.current = true;
    setPhase("starting");
    setOrder(null);
    setErrorMsg("");
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (!activeRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      // Wire hidden decode video
      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      // Wire visible viewfinder video
      if (visVideoRef.current) {
        visVideoRef.current.srcObject = stream;
        visVideoRef.current.setAttribute("playsinline", "true");
        visVideoRef.current.play().catch(() => {});
      }

      setPhase("scanning");

      startScanLoop(async (text) => {
        if (!activeRef.current) return;
        const match = text.match(/\/verify\/([^/?#\s]+)/);
        if (!match) return; // not our QR, keep scanning

        const orderToken = match[1];
        activeRef.current = false;
        stopCamera();
        setPhase("loading");

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URI}/users/order/verify/${orderToken}`
          );
          const fetched = res.data?.data?.order ?? null;
          if (!fetched) throw new Error("Order not found.");
          setOrder(fetched);
          setPhase("order");
        } catch (err) {
          setErrorMsg(err.response?.data?.message || "Order not found or link invalid.");
          setPhase("error");
        }
      });
    } catch (err) {
      if (activeRef.current) {
        setErrorMsg(
          err.name === "NotAllowedError"
            ? "Camera access denied. Please allow camera permission and try again."
            : "Camera not available on this device."
        );
        setPhase("error");
      }
    }
  }, [stopCamera, startScanLoop]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => { activeRef.current = false; stopCamera(); };
  }, [stopCamera]);

  /* ── Wire visible video once scanning starts ── */
  useEffect(() => {
    if (phase === "scanning" && visVideoRef.current && streamRef.current) {
      visVideoRef.current.srcObject = streamRef.current;
      visVideoRef.current.play().catch(() => {});
    }
  }, [phase]);

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
      setOrder((prev) => ({ ...prev, ticketStatus: "delivered" }));
      showToast("success", "✅ Delivered! Returning to scanner...");
      setTimeout(() => {
        activeRef.current = false;
        stopCamera();
        setPhase("idle");
        setOrder(null);
      }, 1800);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update order.");
    } finally {
      setMarking(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const handleScanAgain = () => {
    activeRef.current = false;
    stopCamera();
    setPhase("idle");
    setOrder(null);
  };

  return (
    <div className="qs-page">

      {/* Header */}
      <div className="qs-header">
        <div className="qs-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3"  y="3"  width="7" height="7" rx="1"/>
            <rect x="14" y="3"  width="7" height="7" rx="1"/>
            <rect x="3"  y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5"/>
            <rect x="19" y="14" width="2" height="2" rx="0.5"/>
            <rect x="14" y="19" width="2" height="2" rx="0.5"/>
            <rect x="18" y="19" width="3" height="2" rx="0.5"/>
          </svg>
        </div>
        <div>
          <h1 className="qs-title">Scan Order QR</h1>
          <p className="qs-subtitle">Point camera at a student's order ticket QR code</p>
        </div>
      </div>

      {/* Hidden decode elements */}
      <video  ref={videoRef}  className="qs-hidden-video" muted playsInline />
      <canvas ref={canvasRef} className="qs-hidden-canvas" />

      {/* ── Idle ── */}
      {phase === "idle" && (
        <motion.div
          className="qs-idle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          {/* Decorative glow ring */}
          <div className="qs-idle-ring">
            <div className="qs-idle-ring-inner">
              <svg className="qs-idle-svg" viewBox="0 0 96 96" fill="none">
                <rect x="8"  y="8"  width="28" height="28" rx="4" stroke="currentColor" strokeWidth="3"/>
                <rect x="60" y="8"  width="28" height="28" rx="4" stroke="currentColor" strokeWidth="3"/>
                <rect x="8"  y="60" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="3"/>
                <rect x="15" y="15" width="14" height="14" rx="2" fill="currentColor" opacity="0.5"/>
                <rect x="67" y="15" width="14" height="14" rx="2" fill="currentColor" opacity="0.5"/>
                <rect x="15" y="67" width="14" height="14" rx="2" fill="currentColor" opacity="0.5"/>
                <rect x="60" y="60" width="8"  height="8"  rx="1.5" fill="currentColor" opacity="0.7"/>
                <rect x="72" y="60" width="8"  height="8"  rx="1.5" fill="currentColor" opacity="0.7"/>
                <rect x="60" y="72" width="8"  height="8"  rx="1.5" fill="currentColor" opacity="0.7"/>
                <rect x="72" y="72" width="8"  height="8"  rx="1.5" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
          </div>
          <p className="qs-idle-title">QR Ticket Scanner</p>
          <p className="qs-idle-text">Verify and deliver student orders instantly by scanning their ticket QR code</p>
          <motion.button
            className="qs-start-btn"
            onClick={startCamera}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 7l-7 5 7 5V7z"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Open Camera
          </motion.button>
        </motion.div>
      )}

      {/* ── Starting ── */}
      {phase === "starting" && (
        <div className="qs-center">
          <div className="qs-pulse-ring">
            <div className="qs-spinner" />
          </div>
          <p>Requesting camera access…</p>
        </div>
      )}

      {/* ── Scanning ── */}
      {phase === "scanning" && (
        <motion.div
          className="qs-scanner-wrap"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="qs-viewfinder">
            <video ref={visVideoRef} className="qs-live-video" muted playsInline autoPlay />
            <div className="qs-overlay" aria-hidden="true">
              {/* Dark vignette outside focus zone */}
              <div className="qs-vignette" />
              {/* Focus box outline */}
              <div className="qs-focus-box">
                <div className="qs-bracket qs-bracket--tl" />
                <div className="qs-bracket qs-bracket--tr" />
                <div className="qs-bracket qs-bracket--bl" />
                <div className="qs-bracket qs-bracket--br" />
                <div className="qs-scan-line" />
              </div>
            </div>
          </div>
          <div className="qs-scanning-status">
            <span className="qs-scanning-dot" />
            Scanning for QR code…
          </div>
          <button className="qs-cancel-btn" onClick={handleScanAgain}>Cancel</button>
        </motion.div>
      )}

      {/* ── Loading ── */}
      {phase === "loading" && (
        <div className="qs-center">
          <div className="qs-pulse-ring">
            <div className="qs-spinner" />
          </div>
          <p>Fetching order details…</p>
        </div>
      )}

      {/* ── Error ── */}
      {phase === "error" && (
        <motion.div
          className="qs-center qs-center--error"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="qs-error-ring">
            <span className="qs-error-icon">✕</span>
          </div>
          <p className="qs-error-title">Scan Failed</p>
          <p className="qs-error-msg">{errorMsg}</p>
          <motion.button
            className="qs-retry-btn"
            onClick={() => { activeRef.current = false; setPhase("idle"); }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      )}

      {/* ── Order card ── */}
      <AnimatePresence>
        {phase === "order" && order && (
          <OrderCard
            order={order}
            onMarkDelivered={handleMarkDelivered}
            marking={marking}
            toast={toast}
            onScanAgain={handleScanAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

