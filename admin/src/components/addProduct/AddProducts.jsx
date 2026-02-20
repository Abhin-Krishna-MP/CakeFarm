import React, { useEffect, useRef, useState } from "react";
import "./addProduct.scss";
import { BiImageAdd, IoIosArrowDown, beveragesImage } from "../../constants";
import {
  getCategory,
  uploadCategory,
  updateCategory,
  deleteCategory,
} from "../../features/category/categoryAction";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../../features/product/productAction";

export default function AddProducts() {
  const [productFile, setProductFile] = useState(null);
  const [isLunchItem, setIsLunchItem] = useState(false);
  const [lunchCategory, setLunchCategory] = useState(null);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);
  // Category form controlled state
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  // Edit / delete mode
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getCategory(token));
  }, []);

  useEffect(() => {
    // Find or create "Lunch" category
    const lunch = categories?.find(cat => cat.categoryName.toLowerCase() === 'lunch');
    setLunchCategory(lunch);
  }, [categories]);

  const productNameRef = useRef();
  const productRatingRef = useRef();
  const productDescRef = useRef();
  const productVegRef = useRef();
  const productPriceRef = useRef();
  const productStockRef = useRef();
  const productCatRef = useRef();

  // category refs removed — now using controlled state (catName / catDesc)

  const handleAddProduct = (e) => {
    e.preventDefault();

    // Auto-select Lunch category if isLunchItem is true
    const selectedCategory = isLunchItem && lunchCategory 
      ? lunchCategory.categoryId 
      : productCatRef.current.value;

    const product = {
      productName: productNameRef.current.value,
      image: productFile?.name.replace(/\s+/g, "_"),
      rating: parseFloat(productRatingRef.current.value),
      description: productDescRef.current.value,
      vegetarian: parseInt(productVegRef.current.value),
      price: parseInt(productPriceRef.current.value),
      stock: parseInt(productStockRef.current.value) || 0,
      categoryId: selectedCategory,
      isLunchItem: isLunchItem,
    };

    console.log(productFile, product, token);

    dispatch(addProduct(productFile, product, token));

    productNameRef.current.value = "";
    productRatingRef.current.value = "";
    productDescRef.current.value = "";
    productVegRef.current.value = "";
    productPriceRef.current.value = "";
    productStockRef.current.value = "";
    productCatRef.current.value = "";
    setProductFile(null);
    setIsLunchItem(false);
  };

  // upload category item
  const handleUploadCategory = (e) => {
    e.preventDefault();
    dispatch(uploadCategory(token, { categoryName: catName, categoryDesc: catDesc })).then(() => {
      dispatch(getCategory(token));
      setCatName("");
      setCatDesc("");
    });
  };

  const handleEditClick = (cat) => {
    setEditMode(true);
    setEditingCategory(cat);
    setCatName(cat.categoryName);
    setCatDesc(cat.description || "");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    dispatch(updateCategory(token, editingCategory.categoryId, {
      categoryName: catName,
      categoryDesc: catDesc,
    })).then(() => {
      dispatch(getCategory(token));
      handleCancelEdit();
    });
  };

  const handleDeleteCategory = (categoryId) => {
    dispatch(deleteCategory(token, categoryId)).then(() => {
      dispatch(getCategory(token));
      if (editingCategory?.categoryId === categoryId) handleCancelEdit();
      setConfirmDeleteId(null);
    });
  };

  return (
    <div className="addProdCat">
      <div className="add-product-wrapper">
        <h1>Add New Product Item</h1>
        <form onSubmit={handleAddProduct} className="new-product-form">
          <div
            className={`product-img-wrap${isDraggingProduct ? " dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingProduct(true); }}
            onDragLeave={() => setIsDraggingProduct(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingProduct(false);
              const file = e.dataTransfer.files[0];
              if (file) setProductFile(file);
            }}
          >
            <label htmlFor="product-img">
              {productFile ? (
                <img src={URL.createObjectURL(productFile)} alt="preview" />
              ) : (
                <BiImageAdd className="icon" />
              )}
            </label>
            <input
              type="file"
              onChange={(e) => setProductFile(e.target.files[0])}
              id="product-img"
              accept="image/*"
              hidden
            />
            <p className="drag-hint">
              {productFile ? productFile.name : "Drag & drop or click to upload"}
            </p>
          </div>
          <div className="product-name-wrap">
            <label htmlFor="product-name">Product Name</label>
            <input
              type="text"
              id="product-name"
              placeholder="Enter product Name..."
              required
              ref={productNameRef}
            />
          </div>

          <div className="veg-wrap">
            <label htmlFor="select-category">Select Category</label>
            <select
              type="text"
              id="select-category"
              required
              ref={productVegRef}
            >
              <option value={1}>veg</option>
              <option value={0}>Non-Veg</option>
            </select>
          </div>

          <div className="category-wrap">
            <label htmlFor="select-category">Select Category</label>
            <select
              type="text"
              id="select-category"
              required
              ref={productCatRef}
              disabled={isLunchItem && lunchCategory}
              value={isLunchItem && lunchCategory ? lunchCategory.categoryId : undefined}
            >
              {categories?.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="rating-wrap">
            <label htmlFor="product-rating">Rating</label>
            <input
              type="text"
              id="product-price"
              placeholder="Enter rating 1 to 5..."
              required
              ref={productRatingRef}
            />
          </div>

          <div className="price-wrap">
            <label htmlFor="product-price">Price</label>
            <input
              type="number"
              id="product-price"
              placeholder="Enter price..."
              required
              ref={productPriceRef}
            />
          </div>

          <div className="stock-wrap">
            <label htmlFor="product-stock">Stock Count</label>
            <input
              type="number"
              id="product-stock"
              placeholder="Enter stock count..."
              required
              ref={productStockRef}
            />
          </div>

          <div className="desc-wrap">
            <label htmlFor="product-desc">Description</label>
            <textarea
              placeholder="Enter product description..."
              id="product-desc"
              cols="80"
              rows="5"
              ref={productDescRef}
            ></textarea>
          </div>

          <div className="lunch-item-wrap">
            <label>
              <input
                type="checkbox"
                checked={isLunchItem}
                onChange={(e) => setIsLunchItem(e.target.checked)}
              />
              <span>Mark as Lunch Item</span>
            </label>
          </div>

          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="add-category-wrapper">
        <h1>{editMode ? "Edit Category" : "Add New Category"}</h1>

        {categories && categories.length > 0 && (
          <div className="category-list">
            {categories.map((cat) => (
              <div
                key={cat.categoryId}
                className={`category-list-item${editingCategory?.categoryId === cat.categoryId ? " editing" : ""}`}
              >
                <span className="cat-name">{cat.categoryName}</span>

                {confirmDeleteId === cat.categoryId ? (
                  <div className="confirm-delete">
                    <span>Delete?</span>
                    <button type="button" className="confirm-yes" onClick={() => handleDeleteCategory(cat.categoryId)}>Yes</button>
                    <button type="button" className="confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                  </div>
                ) : (
                  <div className="cat-actions">
                    <button type="button" className="edit-btn" onClick={() => handleEditClick(cat)}>Edit</button>
                    <button type="button" className="delete-btn" onClick={() => setConfirmDeleteId(cat.categoryId)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Add / Edit form ── */}
        <form
          className="new-category-form"
          onSubmit={editMode ? handleUpdateCategory : handleUploadCategory}
        >
          <div className="category-name-wrap">
            <label htmlFor="category-name">Category Name</label>
            <input
              type="text"
              id="category-name"
              placeholder="Enter category name..."
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
          </div>

          <div className="desc-wrap">
            <label htmlFor="category-desc">Description</label>
            <textarea
              id="category-desc"
              cols="80"
              rows="4"
              placeholder="Enter category description..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
            />
          </div>

          <div className="cat-form-actions">
            {editMode && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
            <button type="submit">
              {editMode ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
