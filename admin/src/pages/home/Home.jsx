import React, { useState } from "react";
import "./home.scss";
import MenuSidebar from "../../components/menuSidebar/MenuSidebar";
import Orders from "../../components/orders/Orders";
import AddProducts from "../../components/addProduct/AddProducts";
import UserList from "../../components/userList/UserList";
import ProductList from "../../components/productList/ProductList";
import LunchSettings from "../../components/lunchSettings/LunchSettings";

export default function Home() {
  const [selectedMenu, setSelectedMenu] = useState(1);

  return (
    <div className="home">
      <div className="menu">
        <MenuSidebar
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
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
  );
}
