const express = require("express");
const { createBusiness } = require("../controllers/businessController");
const { protect, authorize } = require("../middleware/authMiddleware.js");
// const { checkSubscription } = require("../middleware/subscriptionMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin"),
  createBusiness
);

module.exports = router;