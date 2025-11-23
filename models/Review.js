const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Please enter review content"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please provide a rating"],
  },
  userName: {
    type: String,
    required: [true, "Please provide a user name or brand name"],
  },
  // Video fields only
  video: {
    type: String, // URL to the video file
  },
  videoId: {
    type: String, // Cloud storage ID or unique identifier
  },
  isBest: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
