import React, { useContext, useEffect, useRef, useState } from "react";
import "./navbar.scss";
import {
  IoSearchSharp,
  LuShoppingCart,
  logo,
  HiHome,
  MdOutlineRestaurant,
  HiOutlineClipboardList,
  HiOutlineUser,
} from "../../constants/index";
import { motion } from "framer-motion";
import context from "../../context/context";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSearchedProducts } from "../../features/userActions/product/productAction";

const resolveAvatar = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/users/${avatar}`;
};

export default function Navbar() {
  const { isToggleCart, setIsToggleCart, navSearch, setNavSearch } = useContext(context);
  const cart = useSelector((select) => select.cart);
  const token = useSelector((select) => select.auth.token);
  const user = useSelector((select) => select.auth.userData);
  const avatarSrc = resolveAvatar(user?.avatar);
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const searchPlaceholder = {
    "/":       "Search food…",
    "/lunch":  "Search dishes…",
    "/orders": "Search orders…",
  }[location.pathname] ?? "Search…";

  const routeClass = {
    "/":       "route-home",
    "/lunch":  "route-lunch",
    "/orders": "route-orders",
  }[location.pathname] ?? "";

  useEffect(() => {
    setNavSearch("");
  }, [location.pathname]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setNavSearch(val);
    if (location.pathname === "/") {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(getSearchedProducts(token, val));
      }, 500);
    }
  };

  const bottomNavItems = [
    { id: "home",    icon: HiHome,                  link: "/",        label: "Home"   },
    { id: "lunch",   icon: MdOutlineRestaurant,      link: "/lunch",   label: "Lunch"  },
    { id: "orders",  icon: HiOutlineClipboardList,   link: "/orders",  label: "Orders" },
    { id: "profile", icon: HiOutlineUser,            link: "/profile", label: "Profile"},
  ];

  return (
    <>
      {/* ─── Top Navbar ─── */}
      <div className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="left">
          <img src={logo} alt="CampusDine" />
        </div>

        {location.pathname !== "/profile" && (
          <div className="mid">
            <div className={`search-inp${routeClass ? " " + routeClass : ""}`}>
              <span className="route-dot" aria-hidden="true" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={navSearch}
                onChange={handleSearch}
              />
              <IoSearchSharp className="icon" onClick={() => {
                if (location.pathname === "/" && navSearch) {
                  clearTimeout(timeoutRef.current);
                  dispatch(getSearchedProducts(token, navSearch));
                }
              }} />
            </div>
          </div>
        )}

        <div className="right">
          {/* Cart icon */}
          <motion.div
            className="cart-div"
            onClick={() => setIsToggleCart(!isToggleCart)}
            whileHover={{ y: -2, scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <LuShoppingCart className="icon" />
            {cart.itemsCount > 0 && (
              <motion.span
                className="items-count"
                key={cart.itemsCount}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {cart.itemsCount}
              </motion.span>
            )}
          </motion.div>


        </div>
      </div>

      {/* ─── Bottom Navigation (mobile) ─── */}
      <nav className="bottom-nav">
        {bottomNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={`bottom-nav-item ${location.pathname === item.link ? "active" : ""}`}
          >
            {item.id === "profile" && avatarSrc ? (
              <img
                src={avatarSrc}
                alt="profile"
                className="nav-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "block";
                }}
              />
            ) : null}
            {item.id === "profile" && avatarSrc ? (
              <HiOutlineUser className="icon" style={{ display: "none" }} />
            ) : (
              <item.icon className="icon" />
            )}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
