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

const uploadCategory = (token, data) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URI}/admin/create-category`,
      data,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    dispatch(uploadCategorySuccess(res.data));
  } catch (error) {
    console.log(error);
    dispatch(uploadCategoryError(error?.response?.data || "Error creating category"));
  }
};

export { getCategory, uploadCategory };

const updateCategory = (token, categoryId, data) => async (dispatch) => {
  try {
    dispatch(updateCategoryRequest());
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URI}/admin/update-category/${categoryId}`,
      data,
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
