import axios from "axios";
import { academicsRequest, academicsSuccess, academicsFailure } from "./academicsSlice";

export const fetchDepartments = () => async (dispatch) => {
  try {
    dispatch(academicsRequest());
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URI}/users/get-departments`
    );
    dispatch(academicsSuccess(res.data));
  } catch (err) {
    dispatch(academicsFailure(err?.response?.data || {}));
  }
};
