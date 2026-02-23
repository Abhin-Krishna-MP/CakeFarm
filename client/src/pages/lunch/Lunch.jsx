import React, { useEffect, useState, useMemo, useContext } from "react";
import { useSelector } from "react-redux";
import context from "../../context/context";
import Navbar from "../../components/navbar/Navbar";
import FoodItemCard from "../../components/foodItemsCard/FoodItemCard";
import "./lunch.scss";

/* ─── Countdown hook ─── */
function useCountdown(deadlineTime, isOpen) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, total: -1 });

  useEffect(() => {
    if (!isOpen || !deadlineTime || !deadlineTime.includes(":")) {
      setTimeLeft({ h: 0, m: 0, s: 0, total: -1 });
      return;
    }

    const tick = () => {
      const [hours, minutes] = deadlineTime.split(":");
      const deadline = new Date();
      deadline.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, total: 0 });
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        total: diff,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineTime, isOpen]);

  return timeLeft;
}

const pad = (n) => String(n).padStart(2, "0");

export default function Lunch() {
  const [lunchProducts, setLunchProducts] = useState([]);
  const [isOrderingOpen, setIsOrderingOpen] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const { navSearch, setNavSearch } = useContext(context);
  const countdown = useCountdown(deadlineTime, isOrderingOpen);

  useEffect(() => {
    checkLunchStatus();
    fetchLunchProducts();
  }, []);

  /* Auto-close when deadline passes */
  useEffect(() => {
    if (!deadlineTime || !deadlineTime.includes(":")) return;
    const [h, m] = deadlineTime.split(":");
    const deadline = new Date();
    deadline.setHours(parseInt(h), parseInt(m), 0, 0);
    const ms = deadline - Date.now();
    if (ms <= 0) { setIsOrderingOpen(false); return; }
    const t = setTimeout(() => setIsOrderingOpen(false), ms);
    return () => clearTimeout(t);
  }, [deadlineTime]);

  const checkLunchStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URI}/lunch/status`);
      const data = await res.json();
      if (data.data) {
        setIsOrderingOpen(data.data.isOpen);
        setDeadlineTime(data.data.orderDeadlineTime);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLunchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URI}/lunch/products`);
      const data = await res.json();
      if (data.data?.products) setLunchProducts(data.data.products);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const convert24To12 = (t) => {
    if (!t || !t.includes(":")) return "--:--";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const filtered = useMemo(() => {
    return lunchProducts.filter((item) => {
      const matchSearch = item.productName.toLowerCase().includes(navSearch.toLowerCase());
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "veg" && item.vegetarian) ||
        (activeFilter === "nonveg" && !item.vegetarian);
      return matchSearch && matchFilter;
    });
  }, [lunchProducts, navSearch, activeFilter]);

  const vegCount = useMemo(() => lunchProducts.filter((i) => i.vegetarian).length, [lunchProducts]);
  const nonvegCount = useMemo(() => lunchProducts.filter((i) => !i.vegetarian).length, [lunchProducts]);

  return (
    <div className="lunch-page">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="lunch-hero">
        <div className="hero-orbs" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <div className="hero-inner">
          {/* Status pill */}
          <div className={`status-pill ${isOrderingOpen ? "open" : "closed"}`}>
            <span className="dot" />
            {isOrderingOpen ? "Ordering Open" : "Ordering Closed"}
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="hero-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
              </svg>
            </span>
            Today's Lunch
          </h1>

          <p className="hero-sub">
            {isOrderingOpen
              ? "Pre-book your favourite combo before the deadline"
              : "Lunch ordering is closed for today — check back tomorrow!"}
          </p>

          {/* Countdown */}
          {isOrderingOpen && countdown.total > 0 && (
            <div className="countdown-wrap">
              <span className="countdown-label">Ordering closes in</span>
              <div className="countdown">
                <div className="tick">
                  <span className="num">{pad(countdown.h)}</span>
                  <span className="unit">Hr</span>
                </div>
                <span className="sep" aria-hidden="true">:</span>
                <div className="tick">
                  <span className="num">{pad(countdown.m)}</span>
                  <span className="unit">Min</span>
                </div>
                <span className="sep" aria-hidden="true">:</span>
                <div className="tick">
                  <span className="num">{pad(countdown.s)}</span>
                  <span className="unit">Sec</span>
                </div>
              </div>
            </div>
          )}

          {/* Closed — show next deadline */}
          {!isOrderingOpen && deadlineTime && (
            <div className="deadline-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              Order by <strong>{convert24To12(deadlineTime)}</strong> tomorrow
            </div>
          )}

          {/* Stats row */}
          {!loading && lunchProducts.length > 0 && (
            <div className="hero-stats">
              <span className="stat">{lunchProducts.length} <em>dishes</em></span>
              <span className="divider" />
              <span className="stat veg">{vegCount} <em>veg</em></span>
              <span className="divider" />
              <span className="stat nonveg">{nonvegCount} <em>non-veg</em></span>
            </div>
          )}
        </div>
      </section>

      {/* ═══ MENU ═══ */}
      <div className="lunch-container">

        {/* ─── Toolbar ─── */}
        <div className="toolbar">
          <div className="filter-pills" role="group" aria-label="Filter by type">
            <button
              className={`pill ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >All</button>
            <button
              className={`pill veg ${activeFilter === "veg" ? "active" : ""}`}
              onClick={() => setActiveFilter("veg")}
            >
              <span className="veg-dot" />Veg
            </button>
            <button
              className={`pill nonveg ${activeFilter === "nonveg" ? "active" : ""}`}
              onClick={() => setActiveFilter("nonveg")}
            >
              <span className="nonveg-dot" />Non-Veg
            </button>
          </div>
        </div>

        {/* ─── Result count ─── */}
        {!loading && (
          <p className="result-count">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} available
          </p>
        )}

        {/* ─── Skeleton ─── */}
        {loading && (
          <div className="lunch-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="sk-img" />
                <div className="sk-body">
                  <div className="sk-line w75" />
                  <div className="sk-line w55" />
                  <div className="sk-line w40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Empty ─── */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              {lunchProducts.length === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              )}
            </div>
            <h3>{lunchProducts.length === 0 ? "No items today" : "No results found"}</h3>
            <p>
              {lunchProducts.length === 0
                ? "Today's lunch menu hasn't been set up yet."
                : "Try a different search term or filter."}
            </p>
            {(navSearch || activeFilter !== "all") && (
              <button
                className="reset-btn"
                onClick={() => { setNavSearch(""); setActiveFilter("all"); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ─── Grid ─── */}
        {!loading && filtered.length > 0 && (
          <div className="lunch-grid">
            {filtered.map((item, i) => (
              <div
                key={item.productId}
                className="card-anim"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <FoodItemCard item={item} isDisabled={!isOrderingOpen} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
