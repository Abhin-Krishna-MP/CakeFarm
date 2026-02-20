import { useDispatch } from "react-redux";
import {
  BiAddToQueue,
  FaRegRectangleList,
  GrContactInfo,
  PiArchiveBox,
  MdLunchDining,
  profilePic,
} from "../../constants/index";
import "./menuSidebar.scss";
import React from "react";
import { logout } from "../../features/auth/authAction";

const navItems = [
  { id: 1, icon: PiArchiveBox, label: "Orders" },
  { id: 2, icon: BiAddToQueue,  label: "Add Product" },
  { id: 3, icon: GrContactInfo,  label: "Users" },
  { id: 4, icon: FaRegRectangleList, label: "Products" },
  { id: 5, icon: MdLunchDining,  label: "Lunch Settings" },
];

export default function MenuSidebar({ selectedMenu, setSelectedMenu, onClose }) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="menu-sidebar">
      <div className="sidebar-top">
        <div className="img-div">
          <img src={profilePic} alt="Admin" />
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
          ✕
        </button>
      </div>

      <ul className="menu-options">
        {navItems.map(({ id, icon: Icon, label }) => (
          <li
            key={id}
            className={selectedMenu === id ? "li-active" : ""}
            onClick={() => setSelectedMenu(id)}
          >
            <Icon className="icon" />
            <span className="nav-label">{label}</span>
          </li>
        ))}
      </ul>

      <div className="bottom">
        <p onClick={handleLogout}>
          <span>⏻</span> Logout
        </p>
      </div>
    </div>
  );
}

