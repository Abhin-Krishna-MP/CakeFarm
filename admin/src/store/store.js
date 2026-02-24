import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import orderSlice from "../features/order/orderSlice";
import productSlice from "../features/product/productSlice";
import categorySlice from "../features/category/categorySlice";
import usersSlice from "../features/users/usersSlice";
import academicsSlice from "../features/academics/academicsSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: orderSlice,
    product: productSlice,
    category: categorySlice,
    users: usersSlice,
    academics: academicsSlice,
  },
});

export default store;
