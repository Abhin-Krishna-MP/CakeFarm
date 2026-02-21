import React, { useContext, useEffect, useState } from "react";
import "./home.scss";
import Navbar from "../../components/navbar/Navbar";
import CategoriesCarousel from "../../components/categoriesCarousel/CategoriesCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideIn, cartDrawerVars, cartMobileVars } from "../../utils/motion";
import FoodItemCard from "../../components/foodItemsCard/FoodItemCard";
import CartItems from "../../components/cartItems/CartItems";
import context from "../../context/context";
import OutsideClickHandler from "react-outside-click-handler";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../features/userActions/product/productAction";

export default function Home() {
  const { isToggleCart, setIsToggleCart } = useContext(context);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const product = useSelector((state) => state.product);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    dispatch(getProducts(token));
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const allItems = product.products || [];

  return (
    <div className="home">
      <OutsideClickHandler onOutsideClick={() => isToggleCart && setIsToggleCart(false)}>
        <Navbar />

        {/* Cart drawer */}
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
      </OutsideClickHandler>

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

