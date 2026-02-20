// function to filter order by status of order
export const filterOrdersByStatus = (orders, status) => {
  if (!orders || !Array.isArray(orders)) {
    return [];
  }
  
  return orders.filter((order) => {
    // Check both orderStatus and status fields for compatibility
    const orderStatus = order.status || order.orderStatus;
    return orderStatus && orderStatus.toLowerCase() === status.toLowerCase();
  });
};

export const searchValueInArrObj = (array, value) => {
  const res = [];

  array.forEach((item) => {
    Object.values(item).forEach((prop) => {
      if (
        typeof prop === "string" &&
        // prop.toLowerCase() === value.toLowerCase() without regex matching
        new RegExp(value, "i").test(prop) // with regexp
      ) {
        res.push(item);
      }
    });
  });

  return res;
};
