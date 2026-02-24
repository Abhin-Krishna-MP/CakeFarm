import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  success: false,
  error: null,
  message: null,
  orderList: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    orderRequest: (state) => {
      state.isLoading = true;
      state.success = false;
      state.error = null;
      state.message = null;
      state.orderList = [];
    },

    createOrderFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message;
      state.success = action.payload.success;
    },

    orderListSuccess: (state, action) => {
      state.isLoading = false;
      state.message = action.payload.message;
      state.orderList = action.payload.data.userOrders;
      state.success = action.payload.success;
    },

    orderListFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message;
      state.success = action.payload.success;
    },

    updateStatus: (state, action) => {
      state.message = action.payload.message;
    },

    errorUpdateStatus: (state, action) => {
      state.error = action.payload.message;
    },

    // Real-time: update a single order in the list without clearing/refetching
    updateOrderStatusRealtime: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orderList?.find((o) => o.orderId === orderId);
      if (order) {
        order.orderStatus = status;
        order.status = status;
        if (status === "delivered") {
          order.ticketStatus = "delivered";
        }
      }
    },
  },
});

export const {
  updateStatus,
  errorUpdateStatus,
  orderRequest,
  orderListSuccess,
  orderListFailure,
  updateOrderStatusRealtime,
} = orderSlice.actions;

export default orderSlice.reducer;
