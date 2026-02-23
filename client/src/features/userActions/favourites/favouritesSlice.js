import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cakefarm_favourites";

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
};

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: {
    productIds: loadFromStorage(),
    viewingFavourites: false,
  },
  reducers: {
    toggleFavourite: (state, action) => {
      const id = action.payload;
      const idx = state.productIds.indexOf(id);
      if (idx === -1) {
        state.productIds.push(id);
      } else {
        state.productIds.splice(idx, 1);
      }
      saveToStorage(state.productIds);
    },
    setViewingFavourites: (state, action) => {
      state.viewingFavourites = action.payload;
    },
  },
});

export const { toggleFavourite, setViewingFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
