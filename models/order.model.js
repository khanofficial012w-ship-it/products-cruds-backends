const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false },
);

const paymentResultSchema = new mongoose.Schema(
  {
    id: String,
    status: String,
    email: String,
    method: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [arrayLimit, "Order must have at least one item"],
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Stripe", "PayPal"],
    },

    paymentResult: paymentResultSchema,

    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },

    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },

    deliveredAt: Date,

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
      index: true,
    },

    trackingNumber: String,

    notes: String,
  },
  { timestamps: true },
);

function arrayLimit(val) {
  return val.length > 0;
}

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
