const mongoose = require("mongoose");

const videoReelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter a title"],
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: [true, "Please provide a video URL"],
  },
  videoCloudId: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  thumbnailCloudId: {
    type: String,
  },
  category: {
    type: String,
    required: [true, "Please enter a category"],
  },
  tags: [String],
  isBest: {
    type: Boolean,
    default: false, // Default to false
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

module.exports = mongoose.model("VideoReel", videoReelSchema);
