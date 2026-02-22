const express = require("express");

const {createProduct, getProduct, updateProduct, deleteProduct} = require("../controllers/productController.js");
const {protect,authorize} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(protect);
router.use(authorize("business_admin"));

router.post('/', createProduct);
router.get("/",getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;