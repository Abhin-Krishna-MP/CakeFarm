import React, { useEffect } from "react";
import "./home.scss";
import Navbar from "../../components/navbar/Navbar";
import CategoriesCarousel from "../../components/categoriesCarousel/CategoriesCarousel";
import { motion } from "framer-motion";
import { fadeIn, slideIn } from "../../utils/motion";
import FoodItemCard from "../../components/foodItemsCard/FoodItemCard";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../features/userActions/product/productAction";

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const product = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProducts(token));
  }, []);

  const allItems = product.products || [];

  return (
    <div className="home">
      <Navbar />

      <div className="home-wrapper">
        {/* Categories */}
        <motion.div
          variants={fadeIn("down", "spring", 0.1, 0.8)}
          initial="hidden"
          animate="show"
          className="category-div"
        >
          <div className="category-section-label">
            <span className="pulse-dot" />
            <h2>Browse Categories</h2>
            <span className="line" />
          </div>
          <CategoriesCarousel />
        </motion.div>

        <motion.h1
          variants={slideIn("left", "spring", 0.1, 0.8)}
          initial="hidden"
          animate="show"
          className="category-name"
        >
          Menu
        </motion.h1>

        <div className="food-items-wrapper">
          {product.loading && (
            [...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
            ))
          )}

          {!product.loading && allItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🍽️</span>
              <h3>No items yet</h3>
              <p>Check back soon — the menu is being prepared!</p>
            </div>
          )}

          {allItems.map((item) => (
            <motion.div
              key={item.productId}
              variants={fadeIn("up", "spring", 0.05, 0.6)}
              initial="hidden"
              animate="show"
            >
              <FoodItemCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

