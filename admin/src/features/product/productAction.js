import axios from "axios";
import {
  deleteProductError,
  deleteProductRequest,
  deleteProductSuccess,
  getProductsFailure,
  getProductsRequest,
  getProductsSuccess,
  uploadProductError,
  uploadProductRequest,
  uploadProductSuccess,
} from "./productSlice";

export const getProducts = (token) => async (dispatch) => {
  try {
    dispatch(getProductsRequest());

    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Include any authorization token if needed
        "Content-Type": "application/json",
      },
    };

    const api_URI = `${import.meta.env.VITE_API_BASE_URI}/users/get-products`;

    const res = await axios.get(api_URI, config);

    dispatch(getProductsSuccess(res.data));
  } catch (error) {
    dispatch(getProductsFailure(error.response.data));
    console.log(error);
  }
};

export const deleteProduct = (token, productId) => async (dispatch) => {
  try {
    dispatch(deleteProductRequest());
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const api_URI = `${
      import.meta.env.VITE_API_BASE_URI
    }/admin/delete-product/${productId}`;

    const res = await axios.delete(api_URI, config);
    dispatch(deleteProductSuccess());
    dispatch(getProducts(token));
  } catch (error) {
    dispatch(deleteProductError("error while deleting product"));
  }
};

export const addProduct = (file, productData, token) => async (dispatch) => {
  try {
    dispatch(uploadProductRequest());

    const config1 = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const config2 = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "Application/json",
      },
    };

    if (file) {
      const data = new FormData();

      data.append("file", file);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/users/upload-images`,
        data,
        config1
      );

      if (res) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URI}/admin/create-product`,
          productData,
          config2
        );

        dispatch(uploadProductSuccess(res.data));
        dispatch(getProducts(token)); // Refresh product list
      }
    }
  } catch (error) {
    console.log(error);
    dispatch(uploadProductError(error.response.data));
  }
};

export const updateProduct = (token, productId, productData, imageFile) => async (dispatch) => {
  try {
    dispatch(uploadProductRequest());

    let imageFilename = null;

    // Upload image first if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/users/upload-images`,
        formData,
        uploadConfig
      );

      if (uploadRes.data && uploadRes.data.data) {
        // Extract just the filename from the response
        const imageUrl = uploadRes.data.data.imageUrl || uploadRes.data.data.url;
        // Get filename only (remove /assets/images/ prefix if present)
        imageFilename = uploadRes.data.data.filename || imageUrl.split('/').pop();
      }
    }

    // Update product with new data and image filename if uploaded
    const updatePayload = {
      ...productData,
      ...(imageFilename && { image: imageFilename }),
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const api_URI = `${import.meta.env.VITE_API_BASE_URI}/admin/update-product/${productId}`;

    const res = await axios.put(api_URI, updatePayload, config);
    
    dispatch(uploadProductSuccess(res.data));
    dispatch(getProducts(token)); // Refresh product list
  } catch (error) {
    console.log("Error updating product:", error);
    dispatch(uploadProductError(error?.response?.data || "Error updating product"));
  }
};
