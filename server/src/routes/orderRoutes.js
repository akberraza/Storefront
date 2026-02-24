const express = require("express");
const {
  createOrder, 
  getOrders,
  getDailySales,
  getMonthlyRevenue,
  getDashboardStats,
  getAdvancedDashboard
} = require("../controllers/orderController");
const {protect, authorize} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post(
    '/',
    protect,
    authorize("business_admin"),
    createOrder
);

router.get(
   "/",
   protect,
   authorize("business_admin"),
   getOrders
  );

router.get(
  "/daily-sales",
  protect,
  authorize("business_admin"),
  getDailySales
);

router.get(
  "/monthly-revenue",
  protect,
  authorize("business_admin"),
  getMonthlyRevenue
);

router.get(
  "/dashboard",
  protect,
  authorize("business_admin"),
  getDashboardStats
);

router.get(
  "/advanced-dashboard",
  protect,
  authorize("business_admin"),
  getAdvancedDashboard
);

module.exports = router;