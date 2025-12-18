const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const mongoose = require("mongoose");

const getCart = async (req, res) => {
  try {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    let cart = await Cart.findOne({ userToken }).lean();

    if (!cart) {
      const newCart = await Cart.create({ userToken, items: [] });
      return res.json({
        status: "success",
        cart: { ...newCart.toObject(), items: [] },
      });
    }
    console.log("cart: ", cart);

    // 🔥 Lấy danh sách product_id (string) → ObjectId
    const productObjectIds = cart.items
      .map((item) => new mongoose.Types.ObjectId(item.product_id))
      .filter(Boolean);

    console.log("productObjectIds: ", productObjectIds);
    // 🔥 Query product
    const products = await Product.find({
      _id: { $in: productObjectIds },
    }).lean();

    // 🔥 Map product theo id
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // 🔥 GÁN PRODUCT VÀO product_id (đúng FE)
    const items = cart.items.map((item) => ({
      quantity: item.quantity,
      product_id: productMap[item.product_id] || null,
    }));

    return res.json({
      status: "success",
      cart: {
        ...cart,
        items,
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken) {
      return res.status(401).json({ message: "Thiếu token" });
    }

    const { product_id, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: "product_id không hợp lệ" });
    }

    let cart = await Cart.findOne({ userToken });

    if (!cart) {
      cart = await Cart.create({
        userToken,
        items: [{ product_id, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === product_id
      );

      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }

      await cart.save();
    }

    return res.status(200).json({
      status: "success",
      cart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật số lượng
const updateQuantity = async (req, res) => {
  try {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken)
      return res.status(400).json({ message: "Token không hợp lệ" });

    const { product_id, quantity } = req.body;

    let cart = await Cart.findOne({ userToken });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id
    );
    if (itemIndex < 0)
      return res.status(404).json({ message: "Item not found in cart" });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa 1 sản phẩm
const removeItem = async (req, res) => {
  try {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken)
      return res.status(400).json({ message: "Token không hợp lệ" });

    const { product_id } = req.params;

    let cart = await Cart.findOne({ userToken });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product_id.toString() !== product_id
    );

    await cart.save();
    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa toàn bộ giỏ
const clearCart = async (req, res) => {
  try {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken)
      return res.status(400).json({ message: "Token không hợp lệ" });

    const cart = await Cart.findOneAndUpdate(
      { userToken },
      { items: [] },
      { new: true }
    );

    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
