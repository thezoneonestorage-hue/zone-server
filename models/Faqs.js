const mongoose = require("mongoose");
const slugify = require("slugify");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "FAQ question is required"],
      unique: true,
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
      maxlength: [2000, "Answer cannot exceed 2000 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "FAQ category is required"],
      trim: true,
      enum: {
        values: [
          "general",
          "pricing",
          "turnaround",
          "revisions",
          "file-formats",
          "process",
          "quality",
          "rights-usage",
          "emergency",
          "collaboration",
        ],
        message:
          "Category must be one of: general, pricing, turnaround, revisions, file-formats, process, quality, rights-usage, emergency, collaboration",
      },
      default: "general",
    },
    priority: {
      type: Number,
      default: 0,
      min: [0, "Priority cannot be negative"],
      max: [10, "Priority cannot exceed 10"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
faqSchema.pre("save", function (next) {
  if (this.isModified("question") || this.isNew) {
    this.slug = slugify(this.question, {
      lower: true,
      strict: true,
      trim: true,
      length: 50, // Limit slug length
    });
  }
  next();
});

// Increment views when FAQ is accessed
faqSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Track helpful feedback
faqSchema.methods.markHelpful = function () {
  this.helpfulCount += 1;
  return this.save();
};

// Track not helpful feedback
faqSchema.methods.markNotHelpful = function () {
  this.notHelpfulCount += 1;
  return this.save();
};

// Static method to get FAQs by category
faqSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({
    priority: -1,
    createdAt: -1,
  });
};

// Static method to get popular FAQs
faqSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ views: -1, helpfulCount: -1 })
    .limit(limit);
};

// Index for better query performance
faqSchema.index({ category: 1, isActive: 1, priority: -1 });
faqSchema.index({ isActive: 1, views: -1 });

const FAQ = mongoose.model("FAQ", faqSchema);
module.exports = FAQ;
