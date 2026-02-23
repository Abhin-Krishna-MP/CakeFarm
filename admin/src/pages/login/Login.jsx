import React, { useRef, useState } from "react";
import "./login.scss";
import { logo, FaEye, FaEyeSlash } from "../../constants/index.js";
import { useDispatch } from "react-redux";
import { signIn } from "../../features/auth/authAction.js";

const FEATURES = [
  { key: "orders",   label: "Manage Orders" },
  { key: "menu",     label: "Edit Menu" },
  { key: "users",    label: "User Control" },
  { key: "lunch",    label: "Lunch Settings" },
];

const CAPABILITIES = [
  { step: "01", title: "Orders in real-time",    desc: "View and process incoming orders as they arrive via live socket updates." },
  { step: "02", title: "Menu management",        desc: "Add, edit or remove products and categories from the canteen menu." },
  { step: "03", title: "Lunch pre-booking",      desc: "Configure lunch availability windows, pricing and ordering limits." },
  { step: "04", title: "User & role management", desc: "View registered users, manage access and monitor activity." },
];

export default function Login() {
  const [hidePass, setHidePass] = useState(true);
  const [loading, setLoading]   = useState(false);
  const emailRef = useRef();
  const passRef  = useRef();
  const dispatch = useDispatch();

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(signIn(emailRef.current.value, passRef.current.value))
      .finally(() => setLoading(false));
  };

  return (
    <div className="login">
      {/* Ambient orbs */}
      <div className="lg-orb lg-orb--1" aria-hidden="true" />
      <div className="lg-orb lg-orb--2" aria-hidden="true" />
      <div className="lg-orb lg-orb--3" aria-hidden="true" />

      <div className="login-wrapper">

        {/* ── LEFT: Form ── */}
        <div className="login-left">
          <div className="login-card">

            {/* Logo */}
            <div className="lg-logo">
              <img src={logo} alt="CakeFarm Admin" />
            </div>

            {/* Heading */}
            <div className="lg-heading">
              <h1><span className="lg-brand">Admin</span> Portal</h1>
              <p>Sign in to manage orders, menu and settings.</p>
            </div>

            {/* Feature pills */}
            <div className="lg-pills">
              {FEATURES.map((f) => (
                <span key={f.key} className={`lg-pill lg-pill--${f.key}`}>{f.label}</span>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="lg-form">
              <div className="lg-field">
                <label htmlFor="al-email">Email</label>
                <input
                  id="al-email"
                  type="email"
                  placeholder="admin@example.com"
                  ref={emailRef}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="lg-field">
                <label htmlFor="al-pass">Password</label>
                <div className="pass-div">
                  <input
                    id="al-pass"
                    type={hidePass ? "password" : "text"}
                    placeholder="Enter your password"
                    ref={passRef}
                    required
                    autoComplete="current-password"
                  />
                  {hidePass
                    ? <FaEyeSlash className="icon" onClick={() => setHidePass(false)} />
                    : <FaEye     className="icon" onClick={() => setHidePass(true)}  />
                  }
                </div>
              </div>

              <button type="submit" className={`lg-btn${loading ? " lg-btn--loading" : ""}`} disabled={loading}>
                <span className="lg-btn__shimmer" aria-hidden="true" />
                {loading ? (
                  <><span className="lg-btn__spinner" aria-hidden="true" /><span>Signing in…</span></>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="lg-btn__arrow">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </form>

            <p className="lg-tos">Access restricted to authorised administrators only.</p>
          </div>
        </div>

        {/* ── RIGHT: Dark info panel (desktop) ── */}
        <div className="login-right" aria-hidden="true">
          <div className="lr-grid" />
          <div className="lr-glow" />
          <div className="lr-body">
            <div className="lr-brand">
              <span className="lr-badge">CakeFarm Admin Panel</span>
              <h2>Everything you need<br />to run the canteen.</h2>
              <p>One dashboard for orders, menu management, user control and lunch pre-booking.</p>
            </div>
            <div className="lr-steps">
              <span className="lr-steps__label">What you can do</span>
              <div className="lr-steps__list">
                {CAPABILITIES.map((s) => (
                  <div key={s.step} className="lr-step">
                    <span className="lr-step__num">{s.step}</span>
                    <div className="lr-step__text">
                      <p className="lr-step__title">{s.title}</p>
                      <p className="lr-step__desc">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
