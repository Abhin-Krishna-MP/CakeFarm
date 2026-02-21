import React, { useContext, useRef, useState } from "react";
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

export default function Navbar() {
  const { isToggleCart, setIsToggleCart } = useContext(context);
  const cart = useSelector((select) => select.cart);
  const token = useSelector((select) => select.auth.token);
  const dispatch = useDispatch();
  const inputRef = useRef();
  const timeoutRef = useRef(null);
  const location = useLocation();

  const handleSearchedProducts = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (inputRef.current?.value) {
        dispatch(getSearchedProducts(token, inputRef.current.value));
      }
    }, 500);
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
      <div className="navbar">
        <div className="left">
          <img src={logo} alt="CampusDine" />
        </div>

        <div className="mid">
          <div className="search-inp">
            <input
              type="text"
              placeholder="Search food..."
              ref={inputRef}
              onChange={handleSearchedProducts}
            />
            <IoSearchSharp className="icon" onClick={handleSearchedProducts} />
          </div>
        </div>

        <div className="right">
          {/* Cart icon */}
          <div className="cart-div" onClick={() => setIsToggleCart(!isToggleCart)}>
            <LuShoppingCart className="icon" />
            {cart.itemsCount > 0 && (
              <span className="items-count">{cart.itemsCount}</span>
            )}
          </div>


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
            {item.id === "orders" && cart.itemsCount > 0 && (
              <span className="cart-badge">{cart.itemsCount}</span>
            )}
            <item.icon className="icon" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
