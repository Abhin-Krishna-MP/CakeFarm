import React from "react";
import "./login.scss";
import { logo } from "../../constants/index.js";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URI}/auth/google`;
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        {/* Left / Main content */}
        <div className="login-left">
          <div className="login-top">
            <div className="logo">
              <img src={logo} alt="CampusDine" />
            </div>
            <h1>Welcome Back 👋</h1>
            <p className="login-subtitle">
              Sign in to access your campus food ordering portal
            </p>
          </div>

          <div className="login-form">
            <button
              type="button"
              className="google-signin-button"
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">or</div>

            <div className="info-text">
              <p>After signing in, you'll need to provide:</p>
              <ul>
                <li>Register Number</li>
                <li>Department</li>
                <li>Semester</li>
                <li>Division</li>
              </ul>
            </div>
          </div>

          <div className="login-footer">
            <p>By continuing, you agree to our terms of service</p>
          </div>
        </div>

        {/* Right panel — visible on tablet+ */}
        <div className="login-right">
          <div className="hero-art">
            <span className="hero-emoji">🍽️</span>
            <h2>CampusDine</h2>
            <p>
              Order snacks, pre-book lunch, and track your meals — all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

