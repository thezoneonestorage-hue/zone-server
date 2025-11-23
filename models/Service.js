const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter service title"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter service description"],
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  features: [
    {
      type: String,
      required: [true, "Please provide at least one feature"],
    },
  ],
  icon: {
    type: String,
    required: [true, "Please provide an icon"],
  },
  details: {
    type: String,
    required: [true, "Please provide service details"],
  },
  deliveryTime: {
    type: String,
    required: [true, "Please provide delivery time"],
  },
  revisions: {
    type: String,
    required: [true, "Please provide revision information"],
  },
  examples: [
    {
      type: String,
      required: [true, "Please provide at least one example"],
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
serviceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Service", serviceSchema);
