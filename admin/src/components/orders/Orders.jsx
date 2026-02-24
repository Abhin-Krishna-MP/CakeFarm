import "./orders.scss";
import { useEffect, useState, useMemo } from "react";
import { BsCurrencyRupee, TfiTime, MdLunchDining } from "../../constants/index";
import { filterOrdersByStatus } from "../../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderList,
  updateOrderStatus,
} from "../../features/order/orderAction";
import { updateOrderStatusRealtime } from "../../features/order/orderSlice";
import io from "socket.io-client";
import {
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiX,
  FiPackage,
  FiShoppingBag,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";

/* ─────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────── */

/** Colored status badge pill */
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const mod =
    s === "placed" || s === "processing"
      ? "placed"
      : s === "delivered" || s === "completed"
      ? "delivered"
      : s === "cancelled"
      ? "cancelled"
      : s === "expired"
      ? "expired"
      : "default";
  return <span className={`ord-badge ord-badge--${mod}`}>{status || "Unknown"}</span>;
}

/** Top-of-list stat pill */
function StatCard({ label, value, accent }) {
  return (
    <div className="ord-stat-card" data-accent={accent}>
      <span className="ord-stat-value">{value}</span>
      <span className="ord-stat-label">{label}</span>
    </div>
  );
}

/** Order card in left list */
function OrderCard({ order, isSelected, onSelect }) {
  const itemsPreview = (order.items || [])
    .slice(0, 2)
    .map((i) => i.productName)
    .join(", ");
  const extraCount = (order.items || []).length - 2;

  return (
    <div
      className={`ord-card${isSelected ? " ord-card--active" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="ord-card__header">
        <span className="ord-card__number">#{order.orderNumber}</span>
        <StatusBadge status={order.orderStatus || order.status} />
      </div>

      <div className="ord-card__user">
        <span className="ord-card__name">{order.user?.username || "User"}</span>
        {order.user?.registerNumber && (
          <span className="ord-card__reg">{order.user.registerNumber}</span>
        )}
      </div>

      {(order.user?.department || order.user?.division || order.user?.semester) && (
        <div className="ord-card__meta">
          {order.user?.department && (
            <span className="ord-card__chip">{order.user.department}</span>
          )}
          {order.user?.semester && (
            <span className="ord-card__chip">Sem {order.user.semester}</span>
          )}
          {order.user?.division && (
            <span className="ord-card__chip">Div {order.user.division}</span>
          )}
        </div>
      )}

      <div className="ord-card__footer">
        <span className="ord-card__preview">
          {itemsPreview || "No items"}
          {extraCount > 0 && ` +${extraCount} more`}
        </span>
        <span className="ord-card__price">
          <BsCurrencyRupee />
          {order.total}
        </span>
      </div>

      {order.pickUpTime && (
        <div className="ord-card__time">
          <TfiTime />
          <span>{order.pickUpTime}</span>
        </div>
      )}
    </div>
  );
}

/** Item row inside the detail panel */
function OrderItemRow({ item }) {
  return (
    <div className="ord-item-row">
      <div className="ord-item-row__img">
        <img
          src={`${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/${item.image}`}
          alt={item.productName}
          loading="lazy"
        />
      </div>
      <span className="ord-item-row__name">{item.productName}</span>
      <span className="ord-item-row__qty">×{item.quantity}</span>
      <span className="ord-item-row__price">
        <BsCurrencyRupee />
        {item.price}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Main Orders page
───────────────────────────────────────────────── */
export default function Orders() {
  // ── Tab & filter state ──────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [activeTab, setActiveTab]           = useState("orders"); // "orders" | "lunch"
  const [statusFilter, setStatusFilter]     = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedDate, setSelectedDate]     = useState(todayStr);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [divisionFilter, setDivisionFilter]   = useState("All");
  const [semesterFilter, setSemesterFilter]   = useState("All");
  const [foodSearch, setFoodSearch]         = useState("");
  const [showFilters, setShowFilters]       = useState(false);
  const [showFoodSummary, setShowFoodSummary] = useState(false);

  // ── Selection & mobile state ────────────────────
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // ── Redux ───────────────────────────────────────
  const orderList = useSelector((state) => state.orders.orderList);
  const { token }  = useSelector((state) => state.auth);
  const dispatch   = useDispatch();

  // Live selected order (auto-updates when socket mutates Redux state)
  const liveSelectedOrder = useMemo(
    () => (orderList || []).find((o) => o.orderId === selectedOrderId) ?? null,
    [orderList, selectedOrderId]
  );
  const currentStatus = (
    liveSelectedOrder?.orderStatus || liveSelectedOrder?.status || ""
  ).toLowerCase();

  // ── Fetch on mount ──────────────────────────────
  useEffect(() => {
    if (token) dispatch(getOrderList(token));
  }, [dispatch, token]);

  // ── Real-time socket ────────────────────────────
  useEffect(() => {
    if (!token) return;
    const socketUrl =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:6005";

    const socket = io(socketUrl, { transports: ["websocket", "polling"], withCredentials: true });

    socket.on("newOrder", () => dispatch(getOrderList(token)));
    socket.on("orderStatusUpdated", ({ orderStatusId, status }) =>
      dispatch(updateOrderStatusRealtime({ orderId: orderStatusId, status }))
    );
    socket.on("orderDelivered", () => dispatch(getOrderList(token)));

    return () => socket.disconnect();
    // ⚠️ Do NOT add orderList — would reconnect on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token]);

  // ── Derived data ────────────────────────────────
  const allOrders = useMemo(() => orderList || [], [orderList]);

  const regularOrders = useMemo(
    () => allOrders.filter((o) => !o.items?.some((i) => i.isLunchItem === true)),
    [allOrders]
  );
  const lunchOrders = useMemo(
    () => allOrders.filter((o) => o.items?.some((i) => i.isLunchItem === true)),
    [allOrders]
  );

  // Unique filter options built from ALL orders
  const uniqueUsers = useMemo(() => {
    const map = new Map();
    allOrders.forEach((o) => { if (o.user?.userId) map.set(o.user.userId, o.user); });
    return Array.from(map.values());
  }, [allOrders]);

  const departments = useMemo(
    () => ["All", ...new Set(uniqueUsers.map((u) => u.department).filter(Boolean))].sort(),
    [uniqueUsers]
  );
  const divisions = useMemo(
    () => ["All", ...new Set(uniqueUsers.map((u) => u.division).filter(Boolean))].sort(),
    [uniqueUsers]
  );
  const semesters = useMemo(
    () => ["All", ...new Set(uniqueUsers.map((u) => u.semester).filter(Boolean))].sort(),
    [uniqueUsers]
  );

  // ── Date helpers ─────────────────────────────────
  const getOrderDate = (order) => {
    if (order.createdAt) return new Date(order.createdAt).toISOString().slice(0, 10);
    if (order.pickUpTime) return new Date(Number(order.pickUpTime)).toISOString().slice(0, 10);
    return null;
  };

  // ── Filtered list for current tab ───────────────
  const rawTabOrders = activeTab === "lunch" ? lunchOrders : regularOrders;

  // Date-scoped base (what the list and stats both operate on)
  const baseOrders = useMemo(
    () => rawTabOrders.filter((o) => !selectedDate || getOrderDate(o) === selectedDate),
    [rawTabOrders, selectedDate]
  );

  const filteredOrders = useMemo(() => {
    // When a search query is active, scan ALL tab orders (ignore the date scope)
    // so that looking up a specific order # or token always works regardless of date.
    const isSearching = searchQuery.trim().length > 0;
    let list = isSearching ? [...rawTabOrders] : [...baseOrders];

    if (statusFilter !== "All") list = filterOrdersByStatus(list, statusFilter);

    if (isSearching) {
      // Strip a leading # so typing "#5" and "5" both match order number 5
      const q = searchQuery.trim().replace(/^#/, "").toLowerCase();
      // Only match order number or serial token
      list = list.filter(
        (o) =>
          o.orderNumber != null && String(o.orderNumber).includes(q) ||
          (o.orderToken || "").toLowerCase().includes(q)
      );
    }

    if (foodSearch.trim()) {
      const q = foodSearch.trim().toLowerCase();
      list = list.filter((o) =>
        o.items?.some((i) => (i.productName || "").toLowerCase().includes(q))
      );
    }

    if (departmentFilter !== "All")
      list = list.filter((o) => o.user?.department === departmentFilter);
    if (semesterFilter !== "All")
      list = list.filter((o) => o.user?.semester === semesterFilter);
    if (divisionFilter !== "All")
      list = list.filter((o) => o.user?.division === divisionFilter);

    return list;
  }, [baseOrders, rawTabOrders, statusFilter, searchQuery, foodSearch, departmentFilter, semesterFilter, divisionFilter]);

  // ── Stats for current tab (date-scoped, unfiltered by other criteria) ──
  const stats = useMemo(() => {
    const count = (predicate) => baseOrders.filter(predicate).length;
    const st = (o) => (o.orderStatus || o.status || "").toLowerCase();
    return {
      total:     baseOrders.length,
      placed:    count((o) => ["placed", "processing"].includes(st(o))),
      delivered: count((o) => ["delivered", "completed"].includes(st(o))),
      cancelled: count((o) => ["cancelled", "expired"].includes(st(o))),
    };
  }, [baseOrders]);

  // ── Lunch food summary (per-item qty totals for current date) ──────────
  const lunchFoodSummary = useMemo(() => {
    const map = {};
    baseOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.productName || "Unknown";
        if (!map[key]) map[key] = { name: key, qty: 0 };
        map[key].qty += item.quantity || 1;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [baseOrders]);

  // ── Handlers ────────────────────────────────────
  const handleStatusUpdate = (newStatus) => {
    if (!liveSelectedOrder?.orderId) return;
    dispatch(updateOrderStatus(token, liveSelectedOrder.orderId, newStatus));
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setSearchQuery("");
    setFoodSearch("");
    setDepartmentFilter("All");
    setDivisionFilter("All");
    setSemesterFilter("All");
    // keep date filter — user explicitly chose it
  };

  const isFiltered =
    statusFilter !== "All" || searchQuery || foodSearch ||
    departmentFilter !== "All" || divisionFilter !== "All" || semesterFilter !== "All";

  // ── Ticket display derived values ────────────────
  // ticketStatus is set by QR scan and never cleared, so only use it when
  // currentStatus hasn't explicitly moved away from delivered.
  const isDetailDelivered = liveSelectedOrder && (
    currentStatus === "delivered" || currentStatus === "completed" ||
    (liveSelectedOrder.ticketStatus === "delivered" &&
      !["placed", "cancelled", "expired"].includes(currentStatus))
  );
  const isDetailCancelled = liveSelectedOrder && (
    currentStatus === "cancelled" || currentStatus === "expired"
  );
  const itemNames = liveSelectedOrder?.items?.map((i) => i.productName) || [];
  const headlineItems =
    itemNames.length <= 2
      ? itemNames.join(", ")
      : `${itemNames[0]}, ${itemNames[1]} +${itemNames.length - 2} more`;
  const pickupDate = liveSelectedOrder?.pickUpTime
    ? new Date(Number(liveSelectedOrder.pickUpTime)).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short",
      })
    : "—";
  const detailPickupTime = liveSelectedOrder?.pickUpTime
    ? new Date(Number(liveSelectedOrder.pickUpTime)).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  // ── Render ───────────────────────────────────────
  return (
    <div className={`ord-page${mobileShowDetail ? " ord-page--detail" : ""}`}>

      {/* ════════════════════ LEFT PANEL ════════════════════ */}
      <div className="ord-left">

        {/* ── Header ── */}
        <div className="ord-left__header">

          {/* Title row */}
          <div className="ord-left__title-row">
            <h2 className="ord-left__title">
              {activeTab === "lunch" ? "Lunch Orders" : "Orders"}
            </h2>
            <button
              className="ord-refresh-btn"
              onClick={() => dispatch(getOrderList(token))}
              title="Refresh"
            >
              <FiRefreshCw />
            </button>
          </div>

          {/* Tabs */}
          <div className="ord-tabs">
            <button
              className={`ord-tab${activeTab === "orders" ? " ord-tab--active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FiShoppingBag />
              Orders
              <span className="ord-tab__count">{regularOrders.length}</span>
            </button>
            <button
              className={`ord-tab ord-tab--lunch${activeTab === "lunch" ? " ord-tab--active" : ""}`}
              onClick={() => setActiveTab("lunch")}
            >
              <MdLunchDining />
              Lunch
              <span className="ord-tab__count">{lunchOrders.length}</span>
            </button>
          </div>

          {/* Stats row */}
          <div className="ord-stats">
            <StatCard label="Total"     value={stats.total}     accent="default" />
            <StatCard label="Placed"    value={stats.placed}    accent="placed" />
            <StatCard label="Delivered" value={stats.delivered} accent="delivered" />
            <StatCard label="Cancelled" value={stats.cancelled} accent="cancelled" />
          </div>

          {/* Search + date + filter toggle */}
          <div className="ord-search-row">
            <div className="ord-search">
              <FiSearch className="ord-search__icon" />
              <input
                className="ord-search__input"
                type="text"
                placeholder="Order # or serial…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="ord-search__clear" onClick={() => setSearchQuery("")}>
                  <FiX />
                </button>
              )}
            </div>

            {/* Date picker */}
            <div className="ord-date-wrap">
              <FiCalendar className="ord-date-icon" />
              <input
                type="date"
                className="ord-date-input"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {selectedDate !== todayStr && (
              <button className="ord-date-today" onClick={() => setSelectedDate(todayStr)}>
                Today
              </button>
            )}

            <button
              className={`ord-filter-toggle${showFilters ? " ord-filter-toggle--open" : ""}${isFiltered ? " ord-filter-toggle--active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              Filters
              {isFiltered && <span className="ord-filter-dot" />}
            </button>
          </div>

          {/* Status chips */}
          <div className="ord-status-chips">
            {["All", "Placed", "Delivered", "Cancelled"].map((s) => (
              <button
                key={s}
                className={`ord-chip ord-chip--status${statusFilter === s ? " ord-chip--active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Lunch food summary */}
          {activeTab === "lunch" && lunchFoodSummary.length > 0 && (
            <div className="ord-food-summary-wrap">
              <button
                className={`ord-food-toggle${showFoodSummary ? " ord-food-toggle--open" : ""}`}
                onClick={() => setShowFoodSummary((v) => !v)}
              >
                <FiBarChart2 />
                Food Count
                <span className="ord-tab__count">{lunchFoodSummary.length}</span>
              </button>
              {showFoodSummary && (
                <div className="ord-food-summary">
                  {lunchFoodSummary.map((item) => (
                    <div key={item.name} className="ord-food-row">
                      <span className="ord-food-row__name">{item.name}</span>
                      <span className="ord-food-row__qty">{item.qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advanced filters (collapsible) */}
          {showFilters && (
            <div className="ord-filters">
              {/* Food search */}
              <div className="ord-search ord-search--sm">
                <FiSearch className="ord-search__icon" />
                <input
                  className="ord-search__input"
                  type="text"
                  placeholder="Filter by food item name…"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                />
                {foodSearch && (
                  <button className="ord-search__clear" onClick={() => setFoodSearch("")}>
                    <FiX />
                  </button>
                )}
              </div>

              {/* Dept / Sem / Div selects */}
              <div className="ord-filters__row">
                <div className="ord-filters__select">
                  <label>Dept</label>
                  <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                    {departments.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="ord-filters__select">
                  <label>Sem</label>
                  <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                    {semesters.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="ord-filters__select">
                  <label>Div</label>
                  <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
                    {divisions.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {isFiltered && (
                <button className="ord-reset-btn" onClick={resetFilters}>
                  Reset all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Order list ── */}
        <div className="ord-left__list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <OrderCard
                key={order.orderId || idx}
                order={order}
                isSelected={selectedOrderId === order.orderId}
                onSelect={() => {
                  setSelectedOrderId(order.orderId);
                  setMobileShowDetail(true);
                }}
              />
            ))
          ) : (
            <div className="ord-empty">
              <FiPackage className="ord-empty__icon" />
              <p>No orders found</p>
              {isFiltered && (
                <button className="ord-reset-btn" onClick={resetFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ RIGHT / DETAIL PANEL — TICKET ════════════════════ */}
      <div className="ord-right">
        {/* Mobile back */}
        <button className="ord-back-btn" onClick={() => setMobileShowDetail(false)}>
          <FiChevronLeft /> Back to Orders
        </button>

        {liveSelectedOrder ? (
          <div className="ord-ticket-scroll">
            <div className="ord-ticket">

              {/* ── TOP HALF (white) ── */}
              <div className={`ord-ticket-top${isDetailDelivered ? " ord-ticket-top--delivered" : ""}${isDetailCancelled ? " ord-ticket-top--cancelled" : ""}`}>
                <div className="ord-ticket-stripe" aria-hidden="true" />

                {isDetailDelivered && (
                  <div className="ord-ticket-stamp" aria-hidden="true">DELIVERED</div>
                )}
                {isDetailCancelled && (
                  <div className="ord-ticket-stamp ord-ticket-stamp--cancelled" aria-hidden="true">CANCELLED</div>
                )}

                <div className="ord-ticket-id-row">
                  <span className="ord-ticket-label-sm">ORDER</span>
                  <span className="ord-ticket-num">#{liveSelectedOrder.orderNumber}</span>
                  <StatusBadge status={liveSelectedOrder.orderStatus || liveSelectedOrder.status} />
                </div>

                <h2 className="ord-ticket-headline">{headlineItems || "No items"}</h2>

                <div className="ord-ticket-meta-row">
                  <div className="ord-ticket-meta-cell">
                    <span className="ord-ticket-meta-label">Time</span>
                    <span className="ord-ticket-meta-val">{detailPickupTime}</span>
                  </div>
                  <div className="ord-ticket-meta-cell">
                    <span className="ord-ticket-meta-label">Date</span>
                    <span className="ord-ticket-meta-val">{pickupDate}</span>
                  </div>
                  <div className="ord-ticket-meta-cell ord-ticket-meta-cell--right">
                    <span className="ord-ticket-meta-label">Items</span>
                    <span className="ord-ticket-meta-val">{liveSelectedOrder.items?.length || 0}</span>
                  </div>
                </div>

                <div className="ord-ticket-items">
                  {liveSelectedOrder.items?.map((item, i) => (
                    <OrderItemRow key={item.orderItemsId || i} item={item} />
                  ))}
                </div>

                <div className="ord-ticket-barcode-zone">
                  <div className="ord-ticket-barcode-bars" aria-hidden="true" />
                  <p className="ord-ticket-serial">
                    SERIAL·{" "}
                    {liveSelectedOrder.orderToken
                      ? liveSelectedOrder.orderToken.slice(0, 16).toUpperCase()
                      : `ORD-${String(liveSelectedOrder.orderNumber).padStart(6, "0")}`}
                  </p>
                </div>
              </div>

              {/* ── TEAR ZONE ── */}
              <div className="ord-ticket-tear" aria-hidden="true">
                <div className="ord-ticket-notch ord-ticket-notch--left" />
                <div className="ord-ticket-notch ord-ticket-notch--right" />
              </div>
              <div className={`ord-ticket-gap${isDetailDelivered || isDetailCancelled ? " ord-ticket-gap--open" : ""}`} />

              {/* ── BOTTOM HALF (amber) ── */}
              <div className="ord-ticket-bottom">
                <div className="ord-ticket-bottom-inner">

                  {/* Left: customer + total */}
                  <div className="ord-ticket-b-left">
                    <span className="ord-ticket-b-label">Customer</span>
                    <span className="ord-ticket-b-val">{liveSelectedOrder.user?.username || "—"}</span>
                    {liveSelectedOrder.user?.registerNumber && (
                      <span className="ord-ticket-b-reg">{liveSelectedOrder.user.registerNumber}</span>
                    )}
                    <div className="ord-ticket-b-chips">
                      {liveSelectedOrder.user?.department && (
                        <span className="ord-ticket-b-chip">{liveSelectedOrder.user.department}</span>
                      )}
                      {liveSelectedOrder.user?.semester && (
                        <span className="ord-ticket-b-chip">Sem {liveSelectedOrder.user.semester}</span>
                      )}
                      {liveSelectedOrder.user?.division && (
                        <span className="ord-ticket-b-chip">Div {liveSelectedOrder.user.division}</span>
                      )}
                    </div>
                    <span className="ord-ticket-b-label" style={{ marginTop: "0.9rem" }}>Total</span>
                    <span className="ord-ticket-b-price">
                      <BsCurrencyRupee />{liveSelectedOrder.total}
                    </span>
                  </div>

                  {/* Right: status update */}
                  <div className="ord-ticket-b-right">
                    <span className="ord-ticket-b-label">Update Status</span>
                    <div className="ord-ticket-status-btns">
                      {["placed", "delivered", "cancelled"].map((s) => (
                        <button
                          key={s}
                          className={`ord-ticket-status-btn ord-ticket-status-btn--${s}${currentStatus === s ? " ord-ticket-status-btn--active" : ""}`}
                          onClick={() => handleStatusUpdate(s)}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="ord-detail__empty">
            <FiPackage className="ord-detail__empty-icon" />
            <p>Select an order to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
