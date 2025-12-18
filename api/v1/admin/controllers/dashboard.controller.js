const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const Favorite = require("../../models/favorite.model");
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

module.exports = {
  // ============================================
  // 1. Doanh thu theo ngày/tháng/năm
  // ============================================
  getRevenue: async (req, res) => {
    try {
      const type = req.query.type || "daily"; // daily | monthly | yearly

      let format = "%Y-%m-%d";
      if (type === "monthly") format = "%Y-%m";
      if (type === "yearly") format = "%Y";

      const revenue = await Order.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: { $dateToString: { format, date: "$created_at" } },
            total: { $sum: "$total_price" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json(revenue);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 2. Số lượng đơn hàng theo trạng thái
  // ============================================
  getOrderStatus: async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 3. Top sản phẩm bán chạy nhất
  // ============================================
  getTopProducts: async (req, res) => {
    try {
      const top = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product_id",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            let: { pid: "$_id" }, // $ _id của Order sau group (là items.product_id)
            pipeline: [
              {
                $match: {
                  $expr: {
                    // So sánh trực tiếp các giá trị ObjectId
                    $eq: ["$_id", "$$pid"],
                    // Dòng này hoạt động nếu cả $_id và $$pid đều là ObjectId
                  },
                },
              },
            ],
            as: "product",
          },
        },
      ]);

      res.json(top);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 4. Số lượng user mới theo tháng
  // ============================================
  getUsersGrowth: async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $match: {
            deleted: false,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$created_at",
                timezone: "Asia/Ho_Chi_Minh",
              },
            },
            totalUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            totalUsers: 1,
          },
        },
      ]);

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 5. Lượt thêm sản phẩm vào giỏ theo ngày
  // ============================================
  getCartCount: async (req, res) => {
    try {
      const stats = await Cart.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: { $size: "$items" } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 6. Sản phẩm được yêu thích nhiều nhất
  // ============================================
  getTopFavorites: async (req, res) => {
    try {
      const favorites = await Favorite.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
      ]);

      res.json(favorites);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 7. Tồn kho sản phẩm
  // ============================================
  getStockStatus: async (req, res) => {
    try {
      const stocks = await Product.find({}, "title stock");

      res.json(stocks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 8. Thống kê sản phẩm theo danh mục
  // ============================================
  getProductsByCategory: async (req, res) => {
    try {
      const stats = await Product.aggregate([
        {
          $group: {
            _id: "$product_category_id", // STRING
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products-category", // ĐÚNG vì bạn dùng collection này
            let: { cid: { $toObjectId: "$_id" } }, // convert STRING → ObjectId
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$cid"] },
                },
              },
            ],
            as: "category",
          },
        },
      ]);

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
