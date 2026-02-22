import { createSlice } from "@reduxjs/toolkit";

const storedUser = (() => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
})();
const token = localStorage.getItem("token");

const initialState = {
  loggedIn: !!(storedUser && storedUser.userId),
  userData: storedUser || null,
  token: token || null,
  message: null,
  error: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.userData = null;
      state.token = null;
    },

    signInSuccess: (state, action) => {
      state.isLoading = false;
      state.userData = action.payload.data.user;
      state.error = null;
      state.token = action.payload.data.accessToken;
      state.message = action.payload.message;
      state.loggedIn = true;
    },

    signInFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || "some error occured";
    },

    signUpRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    signUpSuccess: (state, action) => {
      state.isLoading = false;
      state.userData = action.payload.data.user;
      state.error = null;
      state.token = action.payload.data.accessToken;
      state.message = action.payload.message;
      state.loggedIn = true;
    },

    signUpFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message || "some error occured";
    },

    updateUserInfo: (state, action) => {
      // action.payload = { user: rest } as dispatched from updateUserDetails
      const user = action.payload.user ?? action.payload;
      state.userData = user;
      localStorage.setItem("user", JSON.stringify(user));
    },

    updateUserAvatar: (state, action) => {
      state.userData.avatar = action.payload;
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: action.payload }));
    },

    logOut: (state, action) => {
      state.userData = null;
      state.token = null;
      state.loggedIn = false;
    },
  },
});

export const {
  signInRequest,
  signInSuccess,
  signInFailure,
  signUpRequest,
  signUpSuccess,
  signUpFailure,
  updateUserInfo,
  updateUserAvatar,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;
