import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  success: false,
  error: null,
  message: null,
  orderHistory: [],
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
      state.orderHistory = [];
    },

    createOrderSuccess: (state, action) => {
      state.isLoading = false;
      state.success = action.payload.success;
      state.error = action.payload.message;
    },

    createOrderFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload.message;
      state.success = action.payload.success;
    },

    getOrderHistorySuccess: (state, action) => {
      state.message = action.payload.message;
      state.orderHistory = action.payload.data.userOrders;
      state.success = action.payload.success;
    },

    getOrderHistoryFailure: (state, action) => {
      state.error = action.payload.message;
      state.success = action.payload.success;
    },

    // Real-time: called by the socket "orderDelivered" event to flip the
    // ticket to its torn state without any network round-trip.
    setTicketDelivered: (state, action) => {
      const orderToken = action.payload;
      const order = state.orderHistory?.find((o) => o.orderToken === orderToken);
      if (order) {
        order.ticketStatus = "delivered";
      }
    },

    // Real-time: called by the socket "orderStatusUpdated" event so the
    // Orders page reflects the new status without a page refresh.
    updateOrderStatusRealtime: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orderHistory?.find((o) => o.orderId === orderId);
      if (order) {
        order.orderStatus = status;
        order.status = status;
        // If admin marks as delivered via status, also flip the ticket
        if (status === "delivered") {
          order.ticketStatus = "delivered";
        }
      }
    },
  },
});

export const {
  orderRequest,
  createOrderSuccess,
  createOrderFailure,
  getOrderHistorySuccess,
  getOrderHistoryFailure,
  setTicketDelivered,
  updateOrderStatusRealtime,
} = orderSlice.actions;

export default orderSlice.reducer;
