const express = require("express");
const router = express.Router();

const {createCashier} = require("../controllers/userController.js");
const {protect, authorize} = require("../middleware/authMiddleware.js");
const {checkSubscription} = require("../middleware/subscriptionMiddleware.js");

router.post(
    '/cashier',
    protect,
    authorize("business_admin"),
    checkSubscription,
    createCashier
);

module.exports = router;