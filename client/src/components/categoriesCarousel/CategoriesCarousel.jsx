import React, { useEffect, useState } from "react";
import "./categoriesCarousel.scss";
import CategoryItemCard from "../categoryItemsCard/CategoryItemCard";
import { useDispatch, useSelector } from "react-redux";
import { getCategory } from "../../features/userActions/category/categoryAction";
import { setViewingFavourites } from "../../features/userActions/favourites/favouritesSlice";
import { FaHeart } from "react-icons/fa";
import { getProducts } from "../../features/userActions/product/productAction";

const FAV_ID = -2;

export default function CategoriesCarousel() {
  const [activeSlide, setActiveSlide] = useState(-1);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    dispatch(getCategory(token));
  }, []);

  const category = useSelector((state) => state.category);

  // Wraps setActiveSlide — clears favourites view when switching to a real category
  const handleSetActiveSlide = (id) => {
    if (id !== FAV_ID) dispatch(setViewingFavourites(false));
    setActiveSlide(id);
  };

  const handleFavouritesClick = () => {
    // Ensure the full product list is loaded before filtering
    dispatch(getProducts(token));
    dispatch(setViewingFavourites(true));
    setActiveSlide(FAV_ID);
  };

  return (
    <div className="categories-row">
      {/* All — always first */}
      <CategoryItemCard
        id={-1}
        imgSrc={null}
        itemName="All"
        activeSlide={activeSlide}
        setActiveSlide={handleSetActiveSlide}
        categoryId={null}
      />

      {/* Favourites — always second */}
      <button
        className={`cat-pill fav-pill${activeSlide === FAV_ID ? ' active' : ''}`}
        onClick={handleFavouritesClick}
        type="button"
      >
        <span className="cat-pill__shimmer" aria-hidden="true" />
        <span className="cat-pill__thumb fav-pill__thumb">
          <FaHeart className="fav-pill__icon" />
        </span>
        <span className="cat-pill__label">Favourites</span>
      </button>

      {category.categories?.map((item, index) => (
        <CategoryItemCard
          key={item.categoryId}
          id={index}
          imgSrc={item.categoryImage}
          itemName={item.categoryName}
          activeSlide={activeSlide}
          setActiveSlide={handleSetActiveSlide}
          categoryId={item.categoryId}
        />
      ))}
    </div>
  );
}
