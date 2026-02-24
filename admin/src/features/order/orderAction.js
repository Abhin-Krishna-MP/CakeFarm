import axios from "axios";
import {
  errorUpdateStatus,
  orderListFailure,
  orderListSuccess,
  orderRequest,
  updateStatus,
  updateOrderStatusRealtime,
} from "./orderSlice";

const getOrderList = (token) => async (dispatch) => {
  try {
    dispatch(orderRequest());
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Include any authorization token if needed
        "Content-Type": "application/json",
      },
    };

    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URI}/admin/get-all-orders`,
      config
    );

    dispatch(orderListSuccess(res.data));
  } catch (error) {
    dispatch(orderListFailure(error.response?.data || "Error fetching orders"));
  }
};

const updateOrderStatus = (token, orderId, orderStatus) => async (dispatch) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    // Optimistic update first — UI responds instantly
    dispatch(updateOrderStatusRealtime({ orderId, status: orderStatus }));

    await axios.patch(
      `${import.meta.env.VITE_API_BASE_URI}/admin/update-order-status?orderStatusId=${orderId}&status=${orderStatus}`,
      {},      // body (none needed — params are in query string)
      config   // headers go here as 3rd argument
    );
  } catch (error) {
    console.log(error);
    dispatch(errorUpdateStatus(error?.response?.data || "Error updating status"));
  }
};
export { getOrderList, updateOrderStatus };
