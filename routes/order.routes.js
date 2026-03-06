const express = require("express");
const router = express.Router();

const {
  CreateOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} = require("../controllers/order.controller");

const { protect, isAdmin } = require("../middlewares/auth.middleware");

// USER ROUTES

router.post("/", protect, CreateOrder);

router.get("/my", protect, getMyOrders);

router.get("/:id", protect, getOrderById);

router.patch("/:id/cancel", protect, cancelOrder);

// Admin Routes

router.get("/", protect, isAdmin, getAllOrders);

router.patch("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;
