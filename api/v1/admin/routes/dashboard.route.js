const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Doanh thu theo ngày / tháng / năm
router.get("/revenue", dashboardController.getRevenue);

// Số lượng đơn theo trạng thái
router.get("/orders-status", dashboardController.getOrderStatus);

// Top sản phẩm bán chạy
router.get("/top-products", dashboardController.getTopProducts);

// User mới theo tháng
router.get("/users-growth", dashboardController.getUsersGrowth);

// Lượt thêm sản phẩm vào giỏ
router.get("/cart-count", dashboardController.getCartCount);

// Sản phẩm được yêu thích nhất
router.get("/top-favorites", dashboardController.getTopFavorites);

// Tồn kho sản phẩm
router.get("/stock-status", dashboardController.getStockStatus);

// Sản phẩm theo danh mục
router.get("/products-category", dashboardController.getProductsByCategory);

module.exports = router;
