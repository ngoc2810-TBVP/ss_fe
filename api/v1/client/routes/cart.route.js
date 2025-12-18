const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// Lấy giỏ hàng
router.get("/", cartController.getCart);

// Thêm sản phẩm vào giỏ

// Cập nhật số lượng
router.put("/update", cartController.updateQuantity);

// Xóa sản phẩm khỏi giỏ
router.delete("/remove/:product_id", cartController.removeItem);
router.post("/add", cartController.addToCart);

// Xóa toàn bộ giỏ
router.delete("/clear", cartController.clearCart);

module.exports = router;
