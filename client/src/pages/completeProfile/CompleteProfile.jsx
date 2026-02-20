import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./completeProfile.scss";
import { logo } from "../../constants/index.js";

export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [formData, setFormData] = useState({
    registerNumber: "",
    department: "",
    semester: "",
    division: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/auth/complete-profile`,
        {
          userId,
          ...formData,
        }
      );

      if (response.data.success) {
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        localStorage.setItem("token", response.data.data.accessToken);
        
        // Redirect to home
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile">
      <div className="complete-profile-wrapper">
        <div className="logo">
          <img src={logo} alt="CampusDine Logo" />
        </div>
        <h1>Complete Your Profile</h1>
        <p className="subtitle">Please provide your academic details to continue</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="registerNumber">Register Number *</label>
            <input
              type="text"
              id="registerNumber"
              name="registerNumber"
              value={formData.registerNumber}
              onChange={handleChange}
              placeholder="Enter your register number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Chemical">Chemical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester *</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="division">Division *</label>
            <input
              type="text"
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              placeholder="Enter your division (e.g., A, B, C)"
              required
              maxLength="2"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Completing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
