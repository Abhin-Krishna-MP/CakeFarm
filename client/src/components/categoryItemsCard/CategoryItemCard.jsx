import React from "react";
import "./categoryItemsCard.scss";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../features/userActions/product/productAction";
import { MdOutlineRestaurantMenu, MdOutlineGridView } from "react-icons/md";

export default function CategoryItemCard({
  id,
  imgSrc,
  itemName,
  activeSlide,
  setActiveSlide,
  categoryId,
}) {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const handleOnClick = () => {
    itemName === "All"
      ? dispatch(getProducts(token))
      : dispatch(getProducts(token, categoryId));
    setActiveSlide(id);
  };

  const imageUrl = imgSrc
    ? `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${imgSrc}`
    : null;

  const isActive = activeSlide === id;

  return (
    <button
      className={`cat-pill${isActive ? " active" : ""}`}
      onClick={handleOnClick}
      type="button"
    >
      {/* shimmer sweep layer */}
      <span className="cat-pill__shimmer" aria-hidden="true" />

      <span className="cat-pill__thumb">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={itemName}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <span
          className="cat-pill__fallback"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          {itemName === "All"
            ? <MdOutlineGridView className="cat-pill__icon" />
            : <MdOutlineRestaurantMenu className="cat-pill__icon" />}
        </span>
      </span>
      <span className="cat-pill__label">{itemName}</span>
    </button>
  );
}
