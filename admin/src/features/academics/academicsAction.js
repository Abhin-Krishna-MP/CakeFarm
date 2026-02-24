import axios from "axios";
import {
  academicsRequest,
  academicsSuccess,
  academicsFailure,
  addDepartmentSuccess,
  updateDepartmentSuccess,
  deleteDepartmentSuccess,
} from "./academicsSlice";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
});

const BASE = `${import.meta.env.VITE_API_BASE_URI}/admin`;

export const fetchDepartments = (token) => async (dispatch) => {
  try {
    dispatch(academicsRequest());
    const res = await axios.get(`${BASE}/departments`, authHeaders(token));
    dispatch(academicsSuccess(res.data));
  } catch (err) {
    dispatch(academicsFailure(err?.response?.data || {}));
  }
};

export const createDepartment = (token, name) => async (dispatch) => {
  try {
    const res = await axios.post(`${BASE}/departments`, { name }, authHeaders(token));
    dispatch(addDepartmentSuccess(res.data.data.department));
  } catch (err) {
    dispatch(academicsFailure(err?.response?.data || {}));
  }
};

export const updateDepartment = (token, departmentId, payload) => async (dispatch) => {
  try {
    const res = await axios.put(`${BASE}/departments/${departmentId}`, payload, authHeaders(token));
    dispatch(updateDepartmentSuccess(res.data.data.department));
  } catch (err) {
    dispatch(academicsFailure(err?.response?.data || {}));
  }
};

export const deleteDepartment = (token, departmentId) => async (dispatch) => {
  try {
    await axios.delete(`${BASE}/departments/${departmentId}`, authHeaders(token));
    dispatch(deleteDepartmentSuccess(departmentId));
  } catch (err) {
    dispatch(academicsFailure(err?.response?.data || {}));
  }
};
