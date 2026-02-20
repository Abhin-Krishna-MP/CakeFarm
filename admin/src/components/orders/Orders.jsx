import "./orders.scss";
import { useContext, useEffect, useState, useRef } from "react";
import "swiper/css";
import "swiper/css/scrollbar";
import {
  BsCurrencyRupee,
  TfiTime,
} from "../../constants/index";
import { filterOrdersByStatus } from "../../utils/helper";
import context from "../../context/context";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderList,
  updateOrderStatus,
} from "../../features/order/orderAction";
import io from "socket.io-client";

function OrderListChild({ order, onSelect }) {
  const { selectedOrderItem, setSelectedOrderItem } = useContext(context);

  const handleOrderClick = (order) => {
    // set the selected order with order obj to display order items
    setSelectedOrderItem(order);
    if (onSelect) onSelect();
  };

  return (
    <div
      className={`order-list-child ${
        selectedOrderItem.orderNumber === order.orderNumber
          ? ""
          : "hide-selected-order"
      }`}
      onClick={() => handleOrderClick(order)}
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
  const [selected, setSelected] = useState(0); // Start with "Placed" orders (index 0)
  const [orderTypeTab, setOrderTypeTab] = useState("all"); // "all" or "lunch"
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  
  const orderList = useSelector((state) => state.orders.orderList);
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  const { selectedOrderItem } = useContext(context);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const statusOptions = ["Placed", "Ready", "Delivered"];

  // Extract unique departments, divisions, and semesters from ALL orders (not filtered)
  // Get unique values by aggregating all orders first
  const allOrders = orderList || [];
  
  // Create a map to collect unique user info
  const uniqueUsers = new Map();
  allOrders.forEach(order => {
    if (order.user && order.user.userId) {
      uniqueUsers.set(order.user.userId, order.user);
    }
  });
  
  const usersArray = Array.from(uniqueUsers.values());
  
  const departments = ["All", ...new Set(
    usersArray
      .map((user) => user.department)
      .filter((dept) => dept && dept !== "" && dept !== null)
  )].sort();

  const divisions = ["All", ...new Set(
    usersArray
      .map((user) => user.division)
      .filter((div) => div && div !== "" && div !== null)
  )].sort();

  const semesters = ["All", ...new Set(
    usersArray
      .map((user) => user.semester)
      .filter((sem) => sem && sem !== "" && sem !== null)
  )].sort();

  const handleOrderStatusClick = (index, status) => {
    setSelected(index);
  };

  // Fetch orders on component mount
  useEffect(() => {
    if (token) {
      dispatch(getOrderList(token));
    }
  }, [dispatch, token]);

  // Set up Socket.io connection for real-time updates
  useEffect(() => {
    if (!token) return;

    // Connect to socket server
    const socket = io("http://localhost:6005", {
      transports: ["websocket"],
    });

    // Listen for new order events
    socket.on("newOrder", (data) => {
      console.log("New order received:", data);
      // Refresh orders when new order is created
      dispatch(getOrderList(token));
    });

    // Listen for order status update events
    socket.on("orderStatusUpdated", (data) => {
      console.log("Order status updated:", data);
      // Refresh orders when order status is updated
      dispatch(getOrderList(token));
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch, token]);

  // Apply filters whenever orderList or filters change
  useEffect(() => {
    let filtered = orderList || [];

    // Filter by order type (all or lunch)
    if (orderTypeTab === "lunch") {
      filtered = filtered.filter(order => 
        order.items?.some(item => item.isLunchItem === true)
      );
    }

    // Filter by status
    const selectedStatus = statusOptions[selected];
    filtered = filterOrdersByStatus(filtered, selectedStatus);

    // Filter by department
    if (departmentFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.department === departmentFilter
      );
    }

    // Filter by division
    if (divisionFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.division === divisionFilter
      );
    }

    // Filter by semester
    if (semesterFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.user?.semester === semesterFilter
      );
    }

    setFilteredOrders(filtered);
  }, [orderList, selected, departmentFilter, divisionFilter, semesterFilter, orderTypeTab]);

  const handleStatusTabClick = (newStatus) => {
    if (!selectedOrderItem.orderId) return;
    const orderId = selectedOrderItem.orderId;
    dispatch(updateOrderStatus(token, orderId, newStatus));
  };

  const resetFilters = () => {
    setDepartmentFilter("All");
    setDivisionFilter("All");
    setSemesterFilter("All");
  };

  const handleManualRefresh = () => {
    if (token) {
      dispatch(getOrderList(token));
    }
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
        
        {/* Order Type Tabs (All / Lunch) */}
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
              onClick={() => handleOrderStatusClick(index, status)}
            >
              <p>{status}</p>
            </div>
          ))}
        </div>

        {/* Department/Division/Semester Filters */}
        <div className="additional-filters">
          <div className="filter-group">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
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
                <option key={sem} value={sem}>
                  {sem}
                </option>
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
                <option key={div} value={div}>
                  {div}
                </option>
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
                onSelect={() => setMobileShowDetail(true)}
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
              className={`status-tab ${selectedOrderItem.orderStatus === "placed" || selectedOrderItem.status === "placed" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("placed")}
            >
              Placed
            </button>
            <button
              className={`status-tab ${selectedOrderItem.orderStatus === "ready" || selectedOrderItem.status === "ready" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("ready")}
            >
              Ready
            </button>
            <button
              className={`status-tab ${selectedOrderItem.orderStatus === "delivered" || selectedOrderItem.status === "delivered" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("delivered")}
            >
              Delivered
            </button>
            <button
              className={`status-tab ${selectedOrderItem.orderStatus === "cancelled" || selectedOrderItem.status === "cancelled" ? "active" : ""}`}
              onClick={() => handleStatusTabClick("cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="order-list-items-scroll">
          {selectedOrderItem &&
            selectedOrderItem.items?.map((item, index) => (
              <OrderListItem key={item.orderItemsId || index} item={item} />
            ))}
        </div>

        <div className="submit-update">
          <span>
            Total: <BsCurrencyRupee className="icon" />{" "}
            {selectedOrderItem.total}
          </span>
        </div>
      </div>
    </div>
  );
}
