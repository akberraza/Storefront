const express = require("express");

const {createProduct, getProduct, updateProduct, deleteProduct, getLowStockProducts} = require("../controllers/productController.js");
const {protect,authorize} = require("../middleware/authMiddleware.js");
const {checkSubscription} = require("../middleware/subscriptionMiddleware.js");

const router = express.Router();

router.use(protect);
router.use(authorize("business_admin"));
router.use(checkSubscription);

router.post('/', createProduct);
router.get("/",getProduct);
router.get(
    "/low-stock",
    protect,
    authorize("business_admin"),
    getLowStockProducts
)
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;