const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getRevenueSummary
} = require("../controllers/saleController.js");

const { protect, authorize } = require("../middleware/authMiddleware.js");
const { checkSubscription } = require("../middleware/subscriptionMiddleware.js");

// Create Sale
router.post(
  "/",
  protect,
  authorize("cashier", "business_admin"),
  checkSubscription,
  createSale
);

// Get Sales
router.get(
  '/',
  protect,
  authorize("business_admin"),
  checkSubscription,
  getSales
)

// Revenue Summary
router.get(
  "/summary",
  protect,
  authorize("business_admin"),
  checkSubscription,
  getRevenueSummary
);

module.exports = router;