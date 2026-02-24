import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  departments: [],
  error: null,
};

const academicsSlice = createSlice({
  name: "academics",
  initialState,
  reducers: {
    academicsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    academicsSuccess: (state, action) => {
      state.isLoading = false;
      state.departments = action.payload.data?.departments || [];
    },
    academicsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Failed to load departments";
    },
  },
});

export const { academicsRequest, academicsSuccess, academicsFailure } =
  academicsSlice.actions;

export default academicsSlice.reducer;
