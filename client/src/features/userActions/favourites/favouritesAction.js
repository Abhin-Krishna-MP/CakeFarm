import axios from "axios";
import { setFavourites, toggleFavourite } from "./favouritesSlice";

const API = import.meta.env.VITE_API_BASE_URI;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Load the current user's favourites from the server and hydrate Redux.
 * Call this once when the home / app mounts (after login).
 */
export const loadFavourites = (token) => async (dispatch) => {
  if (!token) return;
  try {
    const res = await axios.get(`${API}/users/favourites`, authHeader(token));
    dispatch(setFavourites(res.data.data.favourites));
  } catch (error) {
    console.error("Failed to load favourites:", error);
  }
};

/**
 * Optimistically toggle a favourite in Redux, then persist to the server.
 * If the server call fails the optimistic update is rolled back.
 */
export const toggleFavouriteApi = (token, productId) => async (dispatch) => {
  // Optimistic update — instant UI feedback
  dispatch(toggleFavourite(productId));
  try {
    const res = await axios.post(
      `${API}/users/favourites/toggle`,
      { productId },
      authHeader(token)
    );
    // Sync with authoritative server state
    dispatch(setFavourites(res.data.data.favourites));
  } catch (error) {
    // Roll back if the request failed
    dispatch(toggleFavourite(productId));
    console.error("Failed to toggle favourite:", error);
  }
};
