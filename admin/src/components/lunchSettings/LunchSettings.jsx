import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdLunchDining } from "react-icons/md";
import {
  FiClock,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiUsers,
  FiTag,
  FiSliders,
} from "react-icons/fi";
import "./lunchSettings.scss";

const INFO_ITEMS = [
  {
    icon: <FiClock />,
    title: "Deadline Enforced Daily",
    desc: "Orders automatically close at the configured time every day.",
  },
  {
    icon: <FiUsers />,
    title: "Student Pre-Booking",
    desc: "Students can pre-order their lunch before the cutoff window.",
  },
  {
    icon: <MdLunchDining />,
    title: "Separate Lunch Queue",
    desc: "Lunch orders are tracked independently from regular orders.",
  },
  {
    icon: <FiTag />,
    title: "Tagging Products",
    desc: "Enable the Lunch Item flag when creating or editing products.",
  },
];

export default function LunchSettings() {
  const [deadlineTime, setDeadlineTime] = useState("10:00");
  const [isEnabled, setIsEnabled]       = useState(true);
  const [loading, setLoading]           = useState(false);
  const [saveState, setSaveState]       = useState("idle"); // idle | saved | error
  const [now, setNow]                   = useState(new Date());

  const { token } = useSelector((state) => state.auth);

  // Live clock — refreshes every 30 s so the status badge stays accurate
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_BASE_URI}/lunch/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.data?.settings) {
        setDeadlineTime(data.data.settings.orderDeadlineTime);
        setIsEnabled(data.data.settings.isEnabled);
      }
    } catch (err) {
      console.error("Error fetching lunch settings:", err);
    }
  };

  const handleSaveSettings = async () => {
    setSaveState("idle");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URI}/lunch/settings`, {
        method: "PUT",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderDeadlineTime: deadlineTime, isEnabled }),
      });
      if (res.ok) {
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    } finally {
      setLoading(false);
      setTimeout(() => setSaveState("idle"), 2800);
    }
  };

  // Compute whether ordering is currently open
  const isOpen = (() => {
    if (!isEnabled) return false;
    const [h, m]   = deadlineTime.split(":").map(Number);
    const deadline = new Date(now);
    deadline.setHours(h, m, 0, 0);
    return now < deadline;
  })();

  const nowStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const timeLabel = (() => {
    const [h, m]   = deadlineTime.split(":").map(Number);
    const deadline = new Date(now);
    deadline.setHours(h, m, 0, 0);
    const diff = Math.round((deadline - now) / 60_000);
    if (!isEnabled) return "Pre-booking disabled";
    if (diff > 0)   return `Closes in ${diff} min`;
    return `Closed ${Math.abs(diff)} min ago`;
  })();

  return (
    <div className="ls-page">

      {/* ── Header ── */}
      <div className="ls-header">
        <div className="ls-header__icon-wrap">
          <MdLunchDining />
        </div>
        <div className="ls-header__text">
          <h1 className="ls-header__title">Lunch Pre-Booking</h1>
          <p className="ls-header__sub">Manage the daily ordering window for students</p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="ls-grid">

        {/* Status card */}
        <div className={`ls-card ls-status-card${isOpen ? " ls-status-card--open" : " ls-status-card--closed"}`}>
          <div className="ls-status-badge">
            {isOpen ? <FiCheck /> : <FiAlertCircle />}
            <span>{isOpen ? "Open" : "Closed"}</span>
          </div>

          <p className="ls-status-headline">
            {isOpen ? "Accepting Orders" : "Not Accepting Orders"}
          </p>
          <p className="ls-status-timelabel">{timeLabel}</p>

          {/* Progress bar: fraction of day elapsed toward deadline */}
          <div className="ls-progress-bar">
            <div
              className="ls-progress-fill"
              style={{
                width: (() => {
                  const [h, m]    = deadlineTime.split(":").map(Number);
                  const totalMins = h * 60 + m;
                  const nowMins   = now.getHours() * 60 + now.getMinutes();
                  return `${Math.min(100, Math.max(0, (nowMins / totalMins) * 100))}%`;
                })(),
              }}
            />
          </div>

          <div className="ls-status-times">
            <div className="ls-stime">
              <span className="ls-stime__label">Current</span>
              <span className="ls-stime__val">{nowStr}</span>
            </div>
            <div className="ls-stime-divider" />
            <div className="ls-stime">
              <span className="ls-stime__label">Deadline</span>
              <span className="ls-stime__val">{deadlineTime}</span>
            </div>
          </div>
        </div>

        {/* Controls card */}
        <div className="ls-card ls-controls-card">

          {/* Enable toggle row */}
          <div className="ls-control-row">
            <div className="ls-control-meta">
              <FiSliders className="ls-control-row__icon" />
              <div>
                <p className="ls-control-title">Enable Pre-Booking</p>
                <p className="ls-control-sub">Allow students to pre-order lunch daily</p>
              </div>
            </div>
            <button
              className={`ls-toggle${isEnabled ? " ls-toggle--on" : ""}`}
              onClick={() => setIsEnabled((v) => !v)}
              role="switch"
              aria-checked={isEnabled}
              type="button"
            >
              <span className="ls-toggle__thumb" />
            </button>
          </div>

          <div className="ls-separator" />

          {/* Deadline time row */}
          <div className="ls-control-row">
            <div className="ls-control-meta">
              <FiClock className="ls-control-row__icon" />
              <div>
                <p className="ls-control-title">Order Deadline</p>
                <p className="ls-control-sub">Students cannot order after this time</p>
              </div>
            </div>
            <div className={`ls-time-wrap${!isEnabled ? " ls-time-wrap--disabled" : ""}`}>
              <input
                type="time"
                className="ls-time-input"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                disabled={!isEnabled}
              />
            </div>
          </div>

          <div className="ls-separator" />

          {/* Save button */}
          <button
            className={`ls-save-btn${loading ? " ls-save-btn--loading" : ""}${saveState === "saved" ? " ls-save-btn--saved" : ""}${saveState === "error" ? " ls-save-btn--error" : ""}`}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <span className="ls-spinner" />
            ) : saveState === "saved" ? (
              <><FiCheck />&nbsp;Saved</>
            ) : saveState === "error" ? (
              <><FiAlertCircle />&nbsp;Failed — try again</>
            ) : (
              <><FiSave />&nbsp;Save Settings</>
            )}
          </button>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="ls-info-section">
        <div className="ls-info-header">
          <FiInfo />
          <h3>How It Works</h3>
        </div>
        <div className="ls-info-grid">
          {INFO_ITEMS.map((item) => (
            <div key={item.title} className="ls-info-card">
              <div className="ls-info-card__icon">{item.icon}</div>
              <div>
                <p className="ls-info-card__title">{item.title}</p>
                <p className="ls-info-card__desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


