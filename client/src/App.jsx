import { useSelector } from "react-redux";
import { useContext, useState, useEffect } from "react";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Orders from "./pages/orders/Orders";
import Profile from "./pages/profile/Profile";
import CompleteProfile from "./pages/completeProfile/CompleteProfile";
import AuthSuccess from "./pages/authSuccess/AuthSuccess";
import Lunch from "./pages/lunch/Lunch";
import VerifyOrder from "./pages/verifyOrder/VerifyOrder";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cartDrawerVars, cartMobileVars } from "./utils/motion";
import CartItems from "./components/cartItems/CartItems";
import context from "./context/context";

function App() {
  const user = useSelector((state) => state.auth.userData);
  const { isToggleCart, setIsToggleCart } = useContext(context);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user && user.userId ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={user && user.userId ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/complete-profile"
            element={<CompleteProfile />}
          />
          <Route
            path="/auth/success"
            element={<AuthSuccess />}
          />
          <Route
            path="/orders"
            element={
              user && user.userId ? <Orders /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile"
            element={
              user && user.userId ? <Profile /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/lunch"
            element={
              user && user.userId ? <Lunch /> : <Navigate to="/login" />
            }
          />
          {/* Public: QR code scan lands here — no auth required */}
          <Route path="/orders/verify/:token" element={<VerifyOrder />} />
        </Routes>

        {/* ─── Global Cart Drawer — accessible from every page ─── */}
        <AnimatePresence>
          {isToggleCart && (
            <>
              <motion.div
                className="cart-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setIsToggleCart(false)}
              />
              <motion.div
                className="cart"
                variants={isMobile ? cartMobileVars : cartDrawerVars}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CartItems />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </BrowserRouter>
    </div>
  );
}

export default App;
