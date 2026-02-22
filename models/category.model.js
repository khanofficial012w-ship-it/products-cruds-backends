const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [80, "Category name cannot exceed 80 characters"],
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    image: {
      url: String,
      public_id: String,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
});

categorySchema.virtual("subCategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

module.exports = mongoose.model("Category", categorySchema);
