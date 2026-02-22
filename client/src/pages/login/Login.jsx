import React, { useState } from "react";
import "./login.scss";
import { logo } from "../../constants/index.js";
import { motion } from "framer-motion";

const FEATURES = [
  { key: "order",  label: "Order Anytime" },
  { key: "track",  label: "Live Tracking" },
  { key: "lunch",  label: "Pre-book Lunch" },
  { key: "fast",   label: "Fast Pickup" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign in with Google",
    desc: "Use your college Google account to get started instantly.",
  },
  {
    step: "02",
    title: "Complete your profile",
    desc: "Add your register number, department, semester and division.",
  },
  {
    step: "03",
    title: "Browse the menu",
    desc: "Explore snacks, meals and beverages available at your canteen.",
  },
  {
    step: "04",
    title: "Order and pick up",
    desc: "Place your order, get a QR ticket and collect when it's ready.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.18 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_API_BASE_URI}/auth/google`;
  };

  return (
    <div className="login">
      {/* Ambient orbs */}
      <div className="lg-orb lg-orb--1" aria-hidden="true" />
      <div className="lg-orb lg-orb--2" aria-hidden="true" />
      <div className="lg-orb lg-orb--3" aria-hidden="true" />

      <div className="login-wrapper">

        {/* ─────────── LEFT: Form ─────────── */}
        <motion.div
          className="login-left"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="login-card"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Logo */}
            <motion.div className="lg-logo" variants={item}>
              <img src={logo} alt="CampusDine" />
            </motion.div>

            {/* Heading */}
            <motion.div className="lg-heading" variants={item}>
              <h1>Welcome to <span className="lg-brand">CampusDine</span></h1>
              <p>Your campus food portal — order, track and pre-book meals effortlessly.</p>
            </motion.div>

            {/* Feature pills */}
            <motion.div className="lg-pills" variants={item}>
              {FEATURES.map((f) => (
                <span key={f.key} className={`lg-pill lg-pill--${f.key}`}>{f.label}</span>
              ))}
            </motion.div>

            {/* Google button */}
            <motion.div className="lg-actions" variants={item}>
              <button
                className={`google-btn${loading ? " google-btn--loading" : ""}`}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="google-btn__shimmer" aria-hidden="true" />
                {loading ? (
                  <>
                    <span className="google-btn__spinner" aria-hidden="true" />
                    <span className="google-btn__text">Redirecting…</span>
                  </>
                ) : (
                  <>
                    <span className="google-btn__icon">
                      <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                    </span>
                    <span className="google-btn__text">Continue with Google</span>
                    <span className="google-btn__arrow">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>

              <p className="lg-hint">First time? You will complete your profile after signing in.</p>
            </motion.div>

            {/* Required fields info */}
            <motion.div className="lg-required" variants={item}>
              <span className="lg-required__label">Required after sign-in</span>
              <div className="lg-required__chips">
                {["Register No.", "Department", "Semester", "Division"].map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </motion.div>

            {/* ToS */}
            <motion.p className="lg-tos" variants={item}>
              By continuing you agree to our <a href="#">Terms of Service</a>
            </motion.p>
          </motion.div>
        </motion.div>

        {/* ─────────── RIGHT: Visual panel (desktop) ─────────── */}
        <motion.div
          className="login-right"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="lr-grid" />
          <div className="lr-glow" />

          <div className="lr-body">
            {/* Brand */}
            <motion.div
              className="lr-brand"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              <span className="lr-badge">Campus Food Portal</span>
              <h2>The smarter way<br />to eat on campus.</h2>
              <p>Sign in with your college Google account and start ordering from your canteen in minutes.</p>
            </motion.div>

            {/* How it works */}
            <motion.div
              className="lr-steps"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.5 }}
            >
              <span className="lr-steps__label">How it works</span>
              <div className="lr-steps__list">
                {HOW_IT_WORKS.map((s, i) => (
                  <motion.div
                    key={s.step}
                    className="lr-step"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.52 + i * 0.08, duration: 0.4 }}
                  >
                    <span className="lr-step__num">{s.step}</span>
                    <div className="lr-step__text">
                      <p className="lr-step__title">{s.title}</p>
                      <p className="lr-step__desc">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

