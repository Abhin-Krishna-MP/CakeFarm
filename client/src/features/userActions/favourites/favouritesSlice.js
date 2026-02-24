import { createSlice } from "@reduxjs/toolkit";

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: {
    productIds: [],
    viewingFavourites: false,
    loading: false,
  },
  reducers: {
    // Called after a successful API fetch — replaces the full list
    setFavourites: (state, action) => {
      state.productIds = action.payload;
      state.loading = false;
    },
    // Optimistic local toggle (immediately reflects in UI before server confirms)
    toggleFavourite: (state, action) => {
      const id = action.payload;
      const idx = state.productIds.indexOf(id);
      if (idx === -1) {
        state.productIds.push(id);
      } else {
        state.productIds.splice(idx, 1);
      }
    },
    setViewingFavourites: (state, action) => {
      state.viewingFavourites = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setFavourites,
  toggleFavourite,
  setViewingFavourites,
  setLoading,
} = favouritesSlice.actions;

export default favouritesSlice.reducer;
