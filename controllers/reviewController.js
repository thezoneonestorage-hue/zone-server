const Review = require("../models/Review");
const cloudinary = require("../utils/cloudinary");

exports.getAllReviews = async (req, res, next) => {
  try {
    // Check if isBest filter is provided in query params
    const { isBest } = req.query;
    let filter = {};

    // If isBest is provided and is 'true', filter by isBest: true
    if (isBest && isBest.toLowerCase() === "true") {
      filter.isBest = true;
    }

    const reviews = await Review.find(filter).populate("user", "name");

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get only reviews with videos
exports.getVideoReviews = async (req, res, next) => {
  try {
    const { isBest } = req.query;
    let filter = {
      video: { $exists: true, $ne: null },
      videoId: { $exists: true, $ne: null },
    };

    // If isBest is provided and is 'true', filter by isBest: true
    if (isBest && isBest.toLowerCase() === "true") {
      filter.isBest = true;
    }

    const reviews = await Review.find(filter).populate("user", "name");

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get only reviews without videos
exports.getTextReviews = async (req, res, next) => {
  try {
    const { isBest } = req.query;
    let filter = {
      $or: [
        { video: { $exists: false } },
        { video: null },
        { videoId: { $exists: false } },
        { videoId: null },
      ],
    };

    // If isBest is provided and is 'true', filter by isBest: true
    if (isBest && isBest.toLowerCase() === "true") {
      filter.isBest = true;
    }

    const reviews = await Review.find(filter).populate("user", "name");

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { content, rating, userName, video, videoId, isBest } = req.body;

    const newReview = await Review.create({
      content,
      rating,
      user: req.user.id,
      userName,
      video: video || null,
      videoId: videoId || null,
      isBest: isBest || false, // Default to false if not provided
    });

    res.status(201).json({
      status: "success",
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({
        status: "fail",
        message: "No review found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: "fail",
        message: "No review found with that ID",
      });
    }

    // Delete video from Cloudinary if videoId exists
    if (review.videoId) {
      await cloudinary.uploader.destroy(review.videoId);
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
