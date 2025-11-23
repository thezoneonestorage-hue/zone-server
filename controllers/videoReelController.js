const VideoReel = require("../models/VideoReel");
const cloudinary = require("../utils/cloudinary");

exports.getAllVideoReels = async (req, res, next) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle isBest filter - if isBest=true, only return videos where isBest=true
    // If isBest is not provided or is false, return all videos
    if (queryObj.isBest === "true") {
      queryObj.isBest = true;
    } else if (queryObj.isBest === "false") {
      // If explicitly set to false, you might want to return non-best videos
      // Or remove the filter to return all videos
      delete queryObj.isBest; // Remove the filter to return all videos
      // Alternatively, if you want to return only non-best videos:
      // queryObj.isBest = false;
    } else {
      // If isBest is not provided, remove it from queryObj
      delete queryObj.isBest;
    }

    // 2) Advanced filtering for category and other fields
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = VideoReel.find(JSON.parse(queryStr)).populate(
      "user",
      "name email"
    );

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // default: newest first
    }

    // Execute query
    const videoReels = await query;

    res.status(200).json({
      status: "success",
      results: videoReels.length,
      data: {
        videoReels,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getVideoReel = async (req, res, next) => {
  try {
    const videoReel = await VideoReel.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!videoReel) {
      return res.status(404).json({
        status: "fail",
        message: "No video reel found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        videoReel,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createVideoReel = async (req, res, next) => {
  try {
    const {
      title,
      description,
      videoUrl,
      videoCloudId,
      thumbnailUrl,
      thumbnailCloudId,
      tags,
      category,
    } = req.body;

    const newVideoReel = await VideoReel.create({
      title,
      description,
      videoUrl,
      videoCloudId,
      thumbnailUrl,
      thumbnailCloudId,
      category,
      tags,
      user: req.user.id, // assuming you're using authentication
      createdAt: Date.now(),
    });

    res.status(201).json({
      status: "success",
      data: {
        videoReel: newVideoReel,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateVideoReel = async (req, res, next) => {
  try {
    const videoReel = await VideoReel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!videoReel) {
      return res.status(404).json({
        status: "fail",
        message: "No video reel found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        videoReel,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteVideoReel = async (req, res, next) => {
  try {
    // First find the video reel to get the Cloudinary IDs
    const videoReel = await VideoReel.findById(req.params.id);

    if (!videoReel) {
      return res.status(404).json({
        status: "fail",
        message: "No video reel found with that ID",
      });
    }

    // Delete video from Cloudinary if videoCloudId exists
    if (videoReel.videoCloudId) {
      await cloudinary.uploader.destroy(videoReel.videoCloudId, {
        resource_type: "video",
      });
    }

    // Delete thumbnail from Cloudinary if thumbnailCloudId exists
    if (videoReel.thumbnailCloudId) {
      await cloudinary.uploader.destroy(videoReel.thumbnailCloudId);
    }

    // Now delete the video reel document from MongoDB
    await VideoReel.findByIdAndDelete(req.params.id);

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
