import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../features/auth/authSlice";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update Redux state
        dispatch(signInSuccess({ data: { user, accessToken: token } }));

        // Redirect to home
        navigate("/");
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      background: "#0d0d12",
      gap: "1rem",
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid rgba(240,96,48,0.2)",
        borderTopColor: "#f06030",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#a09cb8", fontSize: "0.95rem" }}>Signing you in…</p>
    </div>
  );
}
