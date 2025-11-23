const Statistics = require("../models/Statistics");
const AppError = require("../utils/appError");

// @desc    Create a new statistic
// @route   POST /api/v1/statistics
// @access  Private/Admin
exports.createStatistic = async (req, res, next) => {
  try {
    const {
      title,
      value,
      description,
      icon,
      type = "number",
      isActive = true,
      displayOrder = 0,
      additionalData,
    } = req.body;

    // Check for duplicate title
    const existingStatistic = await Statistics.findOne({ title });
    if (existingStatistic) {
      return next(
        new AppError("Statistic with this title already exists", 400)
      );
    }

    const statistic = await Statistics.create({
      title,
      value,
      description,
      icon,
      type,
      isActive,
      displayOrder,
      additionalData,
    });

    res.status(201).json({
      status: "success",
      data: {
        statistic,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all statistics
// @route   GET /api/v1/statistics
// @access  Public
exports.getAllStatistics = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by active status
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === "true";
    }

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Sorting
    const sortBy = req.query.sort || "displayOrder title";

    const statistics = await Statistics.find(filter).sort(sortBy);

    res.status(200).json({
      status: "success",
      results: statistics.length,
      data: {
        statistics,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active statistics only
// @route   GET /api/v1/statistics/active
// @access  Public
exports.getActiveStatistics = async (req, res, next) => {
  try {
    const statistics = await Statistics.find({ isActive: true }).sort(
      "displayOrder title"
    );

    res.status(200).json({
      status: "success",
      results: statistics.length,
      data: {
        statistics,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single statistic by slug
// @route   GET /api/v1/statistics/:slug
// @access  Public
exports.getStatistic = async (req, res, next) => {
  try {
    const statistic = await Statistics.findOne({ slug: req.params.slug });

    if (!statistic) {
      return next(new AppError("No statistic found with that slug", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        statistic,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update statistic
// @route   PATCH /api/v1/statistics/:slug
// @access  Private/Admin
exports.updateStatistic = async (req, res, next) => {
  try {
    const {
      title,
      value,
      description,
      icon,
      type,
      isActive,
      displayOrder,
      additionalData,
    } = req.body;

    // Find statistic
    const statistic = await Statistics.findOne({ slug: req.params.slug });
    if (!statistic) {
      return next(new AppError("No statistic found with that slug", 404));
    }

    // Check for duplicate title if title is being updated
    if (title && title !== statistic.title) {
      const existingStatistic = await Statistics.findOne({ title });
      if (existingStatistic) {
        return next(
          new AppError("Statistic with this title already exists", 400)
        );
      }
    }

    // Update fields
    if (title) statistic.title = title;
    if (value) statistic.value = value;
    if (description !== undefined) statistic.description = description;
    if (icon !== undefined) statistic.icon = icon;
    if (type) statistic.type = type;
    if (isActive !== undefined) statistic.isActive = isActive;
    if (displayOrder !== undefined) statistic.displayOrder = displayOrder;
    if (additionalData !== undefined) statistic.additionalData = additionalData;

    // Save (triggers slug regeneration if title changed)
    await statistic.save();

    res.status(200).json({
      status: "success",
      data: {
        statistic,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle statistic active status
// @route   PATCH /api/v1/statistics/:slug/toggle
// @access  Private/Admin
exports.toggleStatistic = async (req, res, next) => {
  try {
    const statistic = await Statistics.findOne({ slug: req.params.slug });

    if (!statistic) {
      return next(new AppError("No statistic found with that slug", 404));
    }

    statistic.isActive = !statistic.isActive;
    await statistic.save();

    res.status(200).json({
      status: "success",
      data: {
        statistic,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete statistic
// @route   DELETE /api/v1/statistics/:slug
// @access  Private/Admin
exports.deleteStatistic = async (req, res, next) => {
  try {
    const statistic = await Statistics.findOneAndDelete({
      slug: req.params.slug,
    });

    if (!statistic) {
      return next(new AppError("No statistic found with that slug", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
