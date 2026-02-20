import React, { useState } from "react";
import "./home.scss";
import MenuSidebar from "../../components/menuSidebar/MenuSidebar";
import Orders from "../../components/orders/Orders";
import AddProducts from "../../components/addProduct/AddProducts";
import UserList from "../../components/userList/UserList";
import ProductList from "../../components/productList/ProductList";
import LunchSettings from "../../components/lunchSettings/LunchSettings";

const menuLabels = ["", "Orders", "Add Product", "Users", "Products", "Lunch Settings"];

export default function Home() {
  const [selectedMenu, setSelectedMenu] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuSelect = (id) => {
    setSelectedMenu(id);
    setSidebarOpen(false);
  };

  return (
    <div className="home">
      {/* Mobile top bar */}
      <header className="mobile-header">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
        <p className="mobile-title">{menuLabels[selectedMenu]}</p>
      </header>

      {/* Backdrop overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="content-row">
        <div className={`menu${sidebarOpen ? " open" : ""}`}>
          <MenuSidebar
            selectedMenu={selectedMenu}
            setSelectedMenu={handleMenuSelect}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        <div className="menu-items">
          {selectedMenu === 1 && <Orders />}
          {selectedMenu === 2 && <AddProducts />}
          {selectedMenu === 3 && <UserList />}
          {selectedMenu === 4 && <ProductList />}
          {selectedMenu === 5 && <LunchSettings />}
        </div>
      </div>
    </div>
  );
}
