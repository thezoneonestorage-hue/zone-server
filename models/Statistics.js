const mongoose = require("mongoose");
const slugify = require("slugify");

const statisticsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Statistic title is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    value: {
      type: String,
      required: [true, "Statistic value is required"],
      trim: true,
      maxlength: [50, "Value cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    icon: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["number", "percentage", "text", "rating"],
      default: "number",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    additionalData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
statisticsSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

const Statistics = mongoose.model("Statistics", statisticsSchema);
module.exports = Statistics;
