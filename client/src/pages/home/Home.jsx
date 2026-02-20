import React, { useContext, useEffect } from "react";
import "./home.scss";
import Navbar from "../../components/navbar/Navbar";
import CategoriesCarousel from "../../components/categoriesCarousel/CategoriesCarousel";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, menuVars, slideIn } from "../../utils/motion";
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

  useEffect(() => {
    dispatch(getProducts(token));
  }, []);

  const snackItems = product.products?.filter((item) => !item.isLunchItem) || [];

  return (
    <div className="home">
      <OutsideClickHandler onOutsideClick={() => isToggleCart && setIsToggleCart(false)}>
        <Navbar />

        {/* Cart drawer */}
        <AnimatePresence>
          {isToggleCart && (
            <>
              <div className="cart-backdrop" onClick={() => setIsToggleCart(false)} />
              <motion.div
                className="cart"
                variants={menuVars}
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

          {!product.loading && snackItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-emoji">🍽️</span>
              <h3>No items yet</h3>
              <p>Check back soon — the menu is being prepared!</p>
            </div>
          )}

          {snackItems.map((item) => (
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

