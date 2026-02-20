import { mealsImage } from "../../assets";
import {
  AiOutlineEdit,
  BsCurrencyRupee,
  IoCheckmarkSharp,
  MdDeleteOutline,
  RxCross2,
} from "../../constants";
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../features/product/productAction";
import "./productList.scss";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";

function ProductListChild({ product }) {
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    productName: product.productName,
    description: product.description,
    rating: product.rating,
    vegetarian: product.vegetarian,
    price: product.price,
    stock: product.stock || 0,
  });
  const [imageFile, setImageFile] = useState(null);
  
  // Get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return null;
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    // If starts with /assets, it's a path issue - extract filename only
    if (imagePath.startsWith('/assets/images/')) {
      const filename = imagePath.replace('/assets/images/', '');
      return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${filename}`;
    }
    if (imagePath.startsWith('/assets')) {
      const filename = imagePath.split('/').pop();
      return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${filename}`;
    }
    // Otherwise, assume it's just the filename
    return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${imagePath}`;
  };
  
  const [imagePreview, setImagePreview] = useState(getImageUrl(product.image));

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Update imagePreview when product.image changes (after update)
  useEffect(() => {
    setImagePreview(getImageUrl(product.image));
  }, [product.image]);

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(token, productId));
    }
  };

  const handleUpdateProduct = () => {
    dispatch(updateProduct(token, product.productId, editedProduct, imageFile));
    setToggleEditMode(false);
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditedProduct({
      productName: product.productName,
      description: product.description,
      rating: product.rating,
      vegetarian: product.vegetarian,
      price: product.price,
      stock: product.stock || 0,
    });
    setImageFile(null);
    setImagePreview(getImageUrl(product.image));
    setToggleEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="product-list-child">
      <div className="product-name-image">
        <div className="image-wrapper">
          <img src={imagePreview || mealsImage} alt={product.productName} />
          {toggleEditMode && (
            <div className="image-upload">
              <label htmlFor={`file-input-${product.productId}`} className="upload-label">
                📷 Change
              </label>
              <input
                id={`file-input-${product.productId}`}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={editedProduct.productName}
          disabled={!toggleEditMode}
          onChange={(e) => handleInputChange("productName", e.target.value)}
        />
      </div>

      <div className="product-description">
        <textarea
          type="text"
          value={editedProduct.description}
          disabled={!toggleEditMode}
          rows={2}
          cols={20}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>

      <div className="product-rating">
        <input
          type="number"
          value={editedProduct.rating}
          disabled={!toggleEditMode}
          min="0"
          max="5"
          step="0.1"
          onChange={(e) =>
            handleInputChange("rating", parseFloat(e.target.value))
          }
        />
      </div>

      <div className="product-vegetarian">
        {toggleEditMode ? (
          <select
            value={editedProduct.vegetarian ? "1" : "0"}
            onChange={(e) =>
              handleInputChange("vegetarian", parseInt(e.target.value) === 1)
            }
          >
            <option value="1">Veg</option>
            <option value="0">Non-Veg</option>
          </select>
        ) : (
          <input
            type="text"
            value={editedProduct.vegetarian ? "Veg" : "Non-Veg"}
            disabled={true}
          />
        )}
      </div>

      <div className="product-price">
        <BsCurrencyRupee />
        <input
          type="number"
          value={editedProduct.price}
          disabled={!toggleEditMode}
          min="0"
          onChange={(e) =>
            handleInputChange("price", parseInt(e.target.value))
          }
        />
      </div>

      <div className="product-stock">
        <input
          type="number"
          value={editedProduct.stock}
          disabled={!toggleEditMode}
          min="0"
          onChange={(e) =>
            handleInputChange("stock", parseInt(e.target.value))
          }
        />
      </div>

      <div className="user-update">
        {toggleEditMode ? (
          <>
            <IoCheckmarkSharp
              className="icon save-icon"
              onClick={handleUpdateProduct}
              title="Save changes"
            />
            <RxCross2
              className="icon cancel-icon"
              onClick={handleCancelEdit}
              title="Cancel"
            />
          </>
        ) : (
          <>
            <AiOutlineEdit
              className="icon edit-icon"
              onClick={() => setToggleEditMode(true)}
              title="Edit product"
            />
            <MdDeleteOutline
              onClick={() => handleDeleteProduct(product.productId)}
              className="icon delete-icon"
              title="Delete product"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { products: productsFromStore } = useSelector(
    (state) => state.product
  );
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Fetch products on component mount
  useEffect(() => {
    dispatch(getProducts(token));
  }, [dispatch, token]);

  // Update local state when store changes
  useEffect(() => {
    if (productsFromStore) {
      setProducts(productsFromStore);
    }
  }, [productsFromStore]);

  // Handle search
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.productName.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="productlist">
      <div className="product-list-wrapper">
        <div className="head">
          <p>Product List ({filteredProducts.length})</p>
          <input
            type="text"
            placeholder="Search for product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="product-list-scroll">
          <div className="product-list-header">
            <p>Item</p>
            <p>Description</p>
            <p>Rating</p>
            <p>Type</p>
            <p>Price</p>
            <p>Stock</p>
            <p>Actions</p>
          </div>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductListChild key={product.productId || index} product={product} />
            ))
          ) : (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
