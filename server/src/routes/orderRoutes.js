const express = require("express");
const {
  createOrder, 
  getOrders,
  getDailySales,
  getMonthlyRevenue,
  getDashboardStats,
  getAdvancedDashboard,
  refundOrder,
  getSalesByDateRange,
  getTopSellingProducts,
  getMonthlyChartData,
  exportSalesExcel,
  exportSalesPDF
} = require("../controllers/orderController");
const {protect, authorize} = require("../middleware/authMiddleware.js");

const router = express.Router();

// Create Order
router.post(
    '/',
    protect,
    authorize("business_admin", "cashier"),
    createOrder
);

// All Products view
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

router.put(
  "/refund/:id",
  protect,
  authorize("business_admin"),
  refundOrder
)

router.get(
  "/date-range",
  protect,
  authorize("business_admin"),
  getSalesByDateRange
);

// Top Product
router.get(
  "/top-products",
  protect,
  authorize("business_admin"),
  getTopSellingProducts
)

// Data Chart
router.get(
  "/chart-data",
  protect,
  authorize("business_admin"),
  getMonthlyChartData
)

// Sales excel file
router.get(
  "/export/excel",
  authorize("business_admin"),
  exportSalesExcel
);

// Sales pdf
router.get(
  "export/pdf",
  protect,
  authorize("business_admin"),
  exportSalesPDF
)

module.exports = router;