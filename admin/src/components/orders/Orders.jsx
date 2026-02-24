import "./orders.scss";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/scrollbar";
import {
  BsCurrencyRupee,
  TfiTime,
} from "../../constants/index";
import { filterOrdersByStatus } from "../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderList,
  updateOrderStatus,
} from "../../features/order/orderAction";
import { updateOrderStatusRealtime } from "../../features/order/orderSlice";
import io from "socket.io-client";

/* ─── Order row in the left list ─── */
function OrderListChild({ order, isSelected, onSelect }) {
  return (
    <div
      className={`order-list-child ${isSelected ? "" : "hide-selected-order"}`}
      onClick={onSelect}
    >
      <div className="order-info-no">
        <p>
          ORDER NO: <span>{order.orderNumber}</span>
        </p>
        <p>
          <TfiTime className="icon" /> <span>{order.pickUpTime}</span>
        </p>
      </div>
      <div className="order-user-info">
        <p className="user-name">{order.user?.username || "User"}</p>
        {order.user?.registerNumber && (
          <p className="user-reg">Reg: {order.user.registerNumber}</p>
        )}
        {order.user?.department && (
          <p className="user-dept">{order.user.department}</p>
        )}
        {order.user?.semester && order.user?.division && (
          <p className="user-sem-div">
            Sem {order.user.semester} - Div {order.user.division}
          </p>
        )}
      </div>
      <div className="order-info-price">
        <BsCurrencyRupee className="icon" />
        <span>{order.total}</span>
      </div>
    </div>
  );
}

const OrderListItem = ({ item }) => {
  return (
    <div className="order-list-item">
      <div className="img-name">
        <img
          src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${
            item.image
          }`}
          alt={item.productName}
          loading="lazy"
        />
        <p>{item.productName}</p>
      </div>

      <div className="quantity">
        <span>x{item.quantity}</span>
      </div>

      <div className="price">
        <BsCurrencyRupee className="icon" /> {item.price}
      </div>
    </div>
  );
};

export default function Orders() {
  const [selected, setSelected] = useState(0);
  const [orderTypeTab, setOrderTypeTab] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  // Track only the ID — derive the live order object from Redux state
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const orderList = useSelector((state) => state.orders.orderList);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  // Live order derived from Redux — auto-updates when socket fires
  const liveSelectedOrder =
    (orderList || []).find((o) => o.orderId === selectedOrderId) || null;

  // Normalised current status string for status-tab active highlighting
  const currentStatus = (
    liveSelectedOrder?.orderStatus ||
    liveSelectedOrder?.status ||
    ""
  ).toLowerCase();

  // Status filter options (includes All + Cancelled)
  const statusOptions = ["All", "Placed", "Delivered", "Cancelled"];

  // Extract unique filter values from ALL orders
  const allOrders = orderList || [];
  const uniqueUsers = new Map();
  allOrders.forEach((order) => {
    if (order.user?.userId) uniqueUsers.set(order.user.userId, order.user);
  });
  const usersArray = Array.from(uniqueUsers.values());

  const departments = ["All", ...new Set(
    usersArray.map((u) => u.department).filter(Boolean)
  )].sort();
  const divisions = ["All", ...new Set(
    usersArray.map((u) => u.division).filter(Boolean)
  )].sort();
  const semesters = ["All", ...new Set(
    usersArray.map((u) => u.semester).filter(Boolean)
  )].sort();

  // Fetch orders on mount
  useEffect(() => {
    if (token) dispatch(getOrderList(token));
  }, [dispatch, token]);

  // Real-time socket
  useEffect(() => {
    if (!token) return;

    const socketUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:6005";

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    // New order → full refresh (needed to add new row)
    socket.on("newOrder", () => {
      dispatch(getOrderList(token));
    });

    // Status changed (manual tab click OR QR scan delivery) → update in-place
    // orderStatusId is the order's orderId in both cases
    socket.on("orderStatusUpdated", ({ orderStatusId, status }) => {
      dispatch(updateOrderStatusRealtime({ orderId: orderStatusId, status }));
    });

    // orderDelivered: also do a full refresh to sync ticketStatus across all fields
    socket.on("orderDelivered", () => {
      dispatch(getOrderList(token));
    });

    return () => socket.disconnect();
  // ⚠️ Do NOT add orderList here — it would reconnect the socket on every list change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token]);

  // Re-apply filters whenever list or filter settings change
  useEffect(() => {
    let filtered = orderList || [];

    if (orderTypeTab === "lunch") {
      filtered = filtered.filter((order) =>
        order.items?.some((item) => item.isLunchItem === true)
      );
    }

    const selectedStatus = statusOptions[selected];
    if (selectedStatus !== "All") {
      filtered = filterOrdersByStatus(filtered, selectedStatus);
    }

    if (departmentFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.department === departmentFilter
      );
    }
    if (divisionFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.division === divisionFilter
      );
    }
    if (semesterFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.semester === semesterFilter
      );
    }

    setFilteredOrders(filtered);
  }, [orderList, selected, departmentFilter, divisionFilter, semesterFilter, orderTypeTab]);

  const handleStatusTabClick = (newStatus) => {
    if (!liveSelectedOrder?.orderId) return;
    dispatch(updateOrderStatus(token, liveSelectedOrder.orderId, newStatus));
  };

  const resetFilters = () => {
    setDepartmentFilter("All");
    setDivisionFilter("All");
    setSemesterFilter("All");
  };

  const handleManualRefresh = () => {
    if (token) dispatch(getOrderList(token));
  };

  return (
    <div className={`orders${mobileShowDetail ? " show-detail" : ""}`}>
      <div className="order-list-wrapper">
        <div className="heading-wrapper">
          <p className="heading">Orders ({filteredOrders.length})</p>
          <button className="refresh-btn" onClick={handleManualRefresh} title="Refresh orders">
            🔄 Refresh
          </button>
        </div>

        {/* Order Type Tabs */}
        <div className="order-type-tabs">
          <button
            className={orderTypeTab === "all" ? "active" : ""}
            onClick={() => setOrderTypeTab("all")}
          >
            All Orders
          </button>
          <button
            className={orderTypeTab === "lunch" ? "active" : ""}
            onClick={() => setOrderTypeTab("lunch")}
          >
            🍱 Lunch Orders
          </button>
        </div>

        {/* Status Filters */}
        <div className="order-filters">
          {statusOptions.map((status, index) => (
            <div
              key={index}
              className={`filters ${selected === index ? "active" : ""}`}
              onClick={() => setSelected(index)}
            >
              <p>{status}</p>
            </div>
          ))}
        </div>

        {/* Department / Division / Semester Filters */}
        <div className="additional-filters">
          <div className="filter-group">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Semester:</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Division:</label>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
            >
              {divisions.map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
          <button className="reset-filters" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="order-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <OrderListChild
                key={order.orderId || index}
                order={order}
                isSelected={selectedOrderId === order.orderId}
                onSelect={() => {
                  setSelectedOrderId(order.orderId);
                  setMobileShowDetail(true);
                }}
              />
            ))
          ) : (
            <div className="no-orders">
              <p>No orders found</p>
            </div>
          )}
        </div>
      </div>

      <div className="order-list-items-wrapper">
        {/* Mobile back button */}
        <button
          className="mobile-back-btn"
          onClick={() => setMobileShowDetail(false)}
          aria-label="Back to orders list"
        >
          ← Back to Orders
        </button>

        <div className="order-update">
          <p>Order Items Info</p>
          <label>Order Status:</label>
          <div className="status-tabs">
            <button
              className={`status-tab ${currentStatus === "placed" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("placed")}
            >
              Placed
            </button>
            <button
              className={`status-tab ${currentStatus === "delivered" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("delivered")}
            >
              Delivered
            </button>
            <button
              className={`status-tab ${currentStatus === "cancelled" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="order-list-items-scroll">
          {liveSelectedOrder &&
            liveSelectedOrder.items?.map((item, index) => (
              <OrderListItem key={item.orderItemsId || index} item={item} />
            ))}
        </div>

        <div className="submit-update">
          <span>
            Total: <BsCurrencyRupee className="icon" />{" "}
            {liveSelectedOrder?.total}
          </span>
        </div>
      </div>
    </div>
  );
}
