import {
  getCategoryFailure,
  getCategoryRequest,
  getCategorySuccess,
  uploadCategoryError,
  uploadCategorySuccess,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryError,
  deleteCategorySuccess,
  deleteCategoryError,
} from "./categorySlice";
import axios from "axios";

const getCategory = (token) => async (dispatch) => {
  try {
    dispatch(getCategoryRequest());
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URI}/users/get-categories`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    dispatch(getCategorySuccess(res.data));
  } catch (error) {
    dispatch(getCategoryFailure(error.response.data));
  }
};

const uploadCategory = (token, data, imageFile) => async (dispatch) => {
  try {
    let categoryImage = "";

    // Upload image first if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/users/upload-images`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      categoryImage = uploadRes.data?.data?.filename || "";
    }

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URI}/admin/create-category`,
      { ...data, categoryImage },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    dispatch(uploadCategorySuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(uploadCategoryError(error?.response?.data || "Error creating category"));
  }
};

export { getCategory, uploadCategory };

const updateCategory = (token, categoryId, data, imageFile) => async (dispatch) => {
  try {
    dispatch(updateCategoryRequest());

    let updateData = { ...data };

    // Upload new image first if a file was provided
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/users/upload-images`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      updateData.categoryImage = uploadRes.data?.data?.filename || "";
    }
    // If no new image, do NOT pass categoryImage — keep existing value on server

    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URI}/admin/update-category/${categoryId}`,
      updateData,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    dispatch(updateCategorySuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(updateCategoryError(error?.response?.data || "Error updating category"));
  }
};

const deleteCategory = (token, categoryId) => async (dispatch) => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_BASE_URI}/admin/delete-category/${categoryId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(deleteCategorySuccess(categoryId));
  } catch (error) {
    console.log(error);
    dispatch(deleteCategoryError(error?.response?.data || "Error deleting category"));
  }
};

export { updateCategory, deleteCategory };
