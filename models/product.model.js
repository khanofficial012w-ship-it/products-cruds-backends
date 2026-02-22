const mongoose = require("mongoose");
const slugify = require("slugify");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      require: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: string,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    sold: {
      type: Number,
      default: 0,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    reviews: [reviewSchema],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true },
);

productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

productSchema.virtual("discountPercentage").get(function () {
  if (!this.discountPrice) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
