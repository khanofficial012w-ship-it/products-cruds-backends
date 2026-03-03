const Order = require("../models/order.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.isPaid) {
    return res.status(400).json({ message: "Order already paid" });
  }

  const amountInPaisa = order.totalPrice * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaisa,
    currency: "pkr",
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json(
    new ApiResponse(200, {
      clientSecret: paymentIntent.client_secret,
    }),
  );
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.markOrderPaid = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    throw new ApiError(400, "Webhook Error");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const { orderId, userId } = paymentIntent.metadata;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "Processing";

    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email: req.body.email,
      method: req.body.method,
    };

    await order.save();

    await Payment.create({
      order: orderId,
      user: userId,
      provider: "Stripe",
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: "PKR",
      status: "Succeeded",
      rawResponse: paymentIntent,
      paidAt: Date.now(),
    });
  }

  res.status(200).json(new ApiResponse(200, "Order marked as paid"));
});
