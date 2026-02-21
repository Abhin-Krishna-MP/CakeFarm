import { useSelector } from "react-redux";
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

function App() {
  const user = useSelector((state) => state.auth.userData);

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
      </BrowserRouter>
    </div>
  );
}

export default App;
