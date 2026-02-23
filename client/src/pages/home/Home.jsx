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

  const favourites = useSelector((state) => state.favourites);
  const allItems = product.products || [];
  // Use the full unfiltered list for favourites so items from other categories are always found
  const allProducts = product.allProducts?.length ? product.allProducts : allItems;
  const displayItems = favourites.viewingFavourites
    ? allProducts.filter((item) => favourites.productIds.includes(item.productId))
    : allItems;

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
          {favourites.viewingFavourites ? "Favourites" : "Menu"}
        </motion.h1>

        <div className="food-items-wrapper">
          {product.loading && (
            [...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
            ))
          )}

          {!product.loading && favourites.viewingFavourites && displayItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🤍</span>
              <h3>No favourites yet</h3>
              <p>Tap the heart on any item to save it here.</p>
            </div>
          )}

          {!product.loading && !favourites.viewingFavourites && allItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🍽️</span>
              <h3>No items yet</h3>
              <p>Check back soon — the menu is being prepared!</p>
            </div>
          )}

          {displayItems.map((item) => (
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

