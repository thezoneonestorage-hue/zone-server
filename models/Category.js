const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    isShownInCategory: {
      type: Boolean,
      default: true, // Defaults to visible
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
