import React, { useEffect, useState } from "react";
import "./foodItemCard.scss";
import {
  mealsImage,
  IoMdStar,
  GoDotFill,
  LiaRupeeSignSolid,
  FaCirclePlus,
  GoDash,
  GoPlus,
} from "../../constants";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addItemToCart,
  decrementItem,
  incrementItem,
} from "../../features/userActions/cart/cartAction";
import { toggleFavourite } from "../../features/userActions/favourites/favouritesSlice";

export default function FoodItemCard({ item, isDisabled = false }) {
  // state for checking whether an item in added to cart or not
  const [isAddedTocart, setIsAddedTocart] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(0);

  const dispatch = useDispatch();

  // cart state
  const cartItems = useSelector((state) => state.cart).cartItems;

  // favourites state
  const favouriteIds = useSelector((state) => state.favourites.productIds);
  const isFavourite = favouriteIds.includes(item.productId);

  const handleToggleFavourite = (e) => {
    e.stopPropagation();
    dispatch(toggleFavourite(item.productId));
  };
  // console.log(cart);

  useEffect(() => {
    getCurrentQuantity(); // get current item quantity
  }, [cartItems]);

  // handle adding items to cart
  const handleAddItem = () => {
    if (isDisabled) return; // prevent adding if disabled
    dispatch(addItemToCart(item)); // add curent item to cart
    setIsAddedTocart(true);
  };

  // get current quantity of the item
  const getCurrentQuantity = () => {
    const matchedItem = cartItems?.find(
      (cartItem) => cartItem.productId === item.productId
    );
    setItemQuantity(matchedItem?.quantity);
  };

  const handleItemIncrement = () => {
    if (isDisabled) return; // prevent increment if disabled
    dispatch(incrementItem(item)); // increment item
  };

  const handleItemDecrement = () => {
    if (isDisabled) return; // prevent decrement if disabled
    dispatch(decrementItem(item)); // decrement item
  };

  return (
    <div className={`foodItemCard ${isDisabled ? 'disabled' : ''}`}>
      {/* ─── Image ─── */}
      <div className="img-div">
        <img
          src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${item.image}`}
          alt={item.productName}
          loading="lazy"
        />
        {/* Veg/non-veg indicator */}
        <div className={`veg-badge ${item.vegetarian ? 'veg' : 'nonveg'}`} title={item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'} />

        {/* Favourite button */}
        <motion.button
          className={`fav-btn${isFavourite ? ' fav-btn--active' : ''}`}
          onClick={handleToggleFavourite}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          type="button"
          whileTap={{ scale: 0.8 }}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFavourite ? <FaHeart /> : <FaRegHeart />}
        </motion.button>

        {isDisabled && (
          <div className="disabled-overlay">
            <span>Ordering Closed</span>
          </div>
        )}
      </div>

      {/* ─── Body ─── */}
      <div className="item-description">
        <h2 title={item.productName}>{item.productName}</h2>
        <p>{item.description}</p>

        <div className="item-rating">
          <span>
            <IoMdStar className="icon star" />
            {item.rating}
          </span>
          <span>
            <GoDotFill className={`icon ${item.vegetarian ? 'veg' : 'nonveg'}`} />
            {item.vegetarian ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        <div className="item-cost">
          <span>
            <LiaRupeeSignSolid className="icon rupee" />
            {item.price}
          </span>

          <div className="add-to-cart">
            {!itemQuantity ? (
              <motion.div whileTap={{ scale: 0.85 }} onClick={handleAddItem}>
                <FaCirclePlus className="icon" />
              </motion.div>
            ) : (
              <div className="item-count">
                <motion.div whileTap={{ scale: 0.85 }} onClick={handleItemDecrement}>
                  <GoDash className="icon-btn minus" />
                </motion.div>
                <span>{itemQuantity}</span>
                <motion.div whileTap={{ scale: 0.75 }} onClick={handleItemIncrement}>
                  <GoPlus className="icon-btn plus" />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
