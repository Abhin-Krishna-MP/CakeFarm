import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./lunchSettings.scss";

export default function LunchSettings() {
  const [deadlineTime, setDeadlineTime] = useState("10:00");
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URI}/lunch/settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.data?.settings) {
        setDeadlineTime(data.data.settings.orderDeadlineTime);
        setIsEnabled(data.data.settings.isEnabled);
      }
    } catch (error) {
      console.error("Error fetching lunch settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URI}/lunch/settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderDeadlineTime: deadlineTime,
            isEnabled,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Lunch settings updated successfully!");
      } else {
        alert("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating lunch settings:", error);
      alert("Error updating settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lunch-settings">
      <div className="settings-wrapper">
        <h1>Lunch Pre-Booking Settings</h1>

        <div className="settings-form">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
              />
              Enable Lunch Pre-Booking
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="deadline-time">Order Deadline Time:</label>
            <input
              id="deadline-time"
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              disabled={!isEnabled}
            />
            <small>Orders will close at this time each day</small>
          </div>

          <button
            className="save-btn"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="info-box">
          <h3>ℹ️ How It Works:</h3>
          <ul>
            <li>Students can pre-order lunch until the deadline time</li>
            <li>After the deadline, lunch ordering will be closed</li>
            <li>Lunch items are managed separately from regular products</li>
            <li>Mark products as "Lunch Item" when adding/editing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
