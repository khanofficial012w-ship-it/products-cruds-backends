const express = require("express");
const router = express.Router();

const {
  createPaymentIntent,
  markOrderPaid,
} = require("../controllers/payment.controller");

const { protect } = require("../middlewares/auth.middleware");

router.post("/create-intent", protect, createPaymentIntent);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  markOrderPaid,
);

module.exports = router;
