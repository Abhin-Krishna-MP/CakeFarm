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
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      <p>Signing you in...</p>
    </div>
  );
}
