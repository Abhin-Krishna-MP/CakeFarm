import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  categories: [],
  uploadCategory: {},
  message: null,
  error: null,
  uploadCategorySuccess: false,
  uploadCategoryError: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    getCategoryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.message = null;
      state.categories = null;
    },

    getCategorySuccess: (state, action) => {
      state.isLoading = false;
      state.message = action.payload.message || "";
      state.categories = action.payload.data.categories || [];
    },

    getCategoryFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || "some error occured";
    },

    uploadCategorySuccess: (state, action) => {
      state.uploadCategory = action.payload.data;
      state.uploadCategorySuccess = true;
    },

    uploadCategoryError: (state, action) => {
      state.uploadCategoryError =
        action.payload.message ||
        "something went wrong failed uploading category";
    },

    updateCategoryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    updateCategorySuccess: (state, action) => {
      state.isLoading = false;
      state.uploadCategorySuccess = true;
    },

    updateCategoryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "failed to update category";
    },

    deleteCategorySuccess: (state, action) => {
      state.isLoading = false;
      state.categories = (state.categories || []).filter(
        (cat) => cat.categoryId !== action.payload
      );
    },

    deleteCategoryError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "failed to delete category";
    },
  },
});

export const {
  getCategoryRequest,
  getCategorySuccess,
  getCategoryFailure,
  uploadCategorySuccess,
  uploadCategoryError,
  updateCategoryRequest,
  updateCategorySuccess,
  updateCategoryError,
  deleteCategorySuccess,
  deleteCategoryError,
} = categorySlice.actions;

export default categorySlice.reducer;
