import React, { useEffect, useState } from "react";
import "./categoriesCarousel.scss";
import CategoryItemCard from "../categoryItemsCard/CategoryItemCard";
import { useDispatch, useSelector } from "react-redux";
import { getCategory } from "../../features/userActions/category/categoryAction";

export default function CategoriesCarousel() {
  const [activeSlide, setActiveSlide] = useState(-1);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    dispatch(getCategory(token));
  }, []);

  const category = useSelector((state) => state.category);

  return (
    <div className="categories-row">
      {/* All — always first */}
      <CategoryItemCard
        id={-1}
        imgSrc={null}
        itemName="All"
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        categoryId={null}
      />

      {category.categories?.map((item, index) => (
        <CategoryItemCard
          key={item.categoryId}
          id={index}
          imgSrc={item.categoryImage}
          itemName={item.categoryName}
          activeSlide={activeSlide}
          setActiveSlide={setActiveSlide}
          categoryId={item.categoryId}
        />
      ))}
    </div>
  );
}
