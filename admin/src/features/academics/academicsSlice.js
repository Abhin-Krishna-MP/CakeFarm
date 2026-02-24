import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  departments: [],
  error: null,
  message: null,
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
      state.departments = action.payload.data.departments || [];
      state.message = action.payload.message || "";
    },
    academicsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "Something went wrong";
    },
    addDepartmentSuccess: (state, action) => {
      state.departments = [...(state.departments || []), action.payload];
    },
    updateDepartmentSuccess: (state, action) => {
      state.departments = state.departments.map((d) =>
        d._id === action.payload._id ? action.payload : d
      );
    },
    deleteDepartmentSuccess: (state, action) => {
      state.departments = state.departments.filter((d) => d._id !== action.payload);
    },
  },
});

export const {
  academicsRequest,
  academicsSuccess,
  academicsFailure,
  addDepartmentSuccess,
  updateDepartmentSuccess,
  deleteDepartmentSuccess,
} = academicsSlice.actions;

export default academicsSlice.reducer;
