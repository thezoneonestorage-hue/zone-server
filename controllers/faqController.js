const FAQ = require("../models/Faqs");
const AppError = require("../utils/appError");

// @desc    Create a new FAQ
// @route   POST /api/v1/faqs
// @access  Private/Admin
exports.createFAQ = async (req, res, next) => {
  try {
    const {
      question,
      answer,
      category,
      priority = 0,
      isActive = true,
    } = req.body;

    // 1) Check for duplicate question
    const existingFAQ = await FAQ.findOne({ question });
    if (existingFAQ) {
      return next(new AppError("FAQ with this question already exists", 400));
    }

    // 2) Create FAQ (slug auto-generated via pre-save hook)
    const faq = await FAQ.create({
      question,
      answer,
      category,
      priority,
      isActive,
    });

    res.status(201).json({
      status: "success",
      data: {
        faq,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all FAQs (with filtering and sorting)
// @route   GET /api/v1/faqs
// @access  Public
exports.getAllFAQs = async (req, res, next) => {
  try {
    // 1) Filtering
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.isActive) {
      filter.isActive = req.query.isActive === "true";
    } else {
      // Default to active FAQs only for public access
      filter.isActive = true;
    }

    // 2) Search functionality
    if (req.query.search) {
      filter.$or = [
        { question: { $regex: req.query.search, $options: "i" } },
        { answer: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // 3) Sorting
    let sortBy = {};
    switch (req.query.sort) {
      case "popular":
        sortBy = { views: -1, helpfulCount: -1 };
        break;
      case "recent":
        sortBy = { createdAt: -1 };
        break;
      case "priority":
        sortBy = { priority: -1, createdAt: -1 };
        break;
      default:
        sortBy = { priority: -1, createdAt: -1 };
    }

    // 4) Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 5) Execute query
    const faqs = await FAQ.find(filter).sort(sortBy).skip(skip).limit(limit);

    // 6) Get total count for pagination
    const total = await FAQ.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: faqs.length,
      data: {
        faqs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single FAQ by slug
// @route   GET /api/v1/faqs/:slug
// @access  Public
exports.getFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findOne({ slug: req.params.slug });

    if (!faq) {
      return next(new AppError("No FAQ found with that slug", 404));
    }

    // Increment views when FAQ is accessed
    await faq.incrementViews();

    res.status(200).json({
      status: "success",
      data: {
        faq,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update FAQ
// @route   PATCH /api/v1/faqs/:slug
// @access  Private/Admin
exports.updateFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, priority, isActive } = req.body;

    // 1) Find FAQ
    const faq = await FAQ.findOne({ slug: req.params.slug });
    if (!faq) {
      return next(new AppError("No FAQ found with that slug", 404));
    }

    // 2) Check for duplicate question if question is being updated
    if (question && question !== faq.question) {
      const existingFAQ = await FAQ.findOne({ question });
      if (existingFAQ) {
        return next(new AppError("FAQ with this question already exists", 400));
      }
    }

    // 3) Update fields
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (priority !== undefined) faq.priority = priority;
    if (isActive !== undefined) faq.isActive = isActive;

    // 4) Save (triggers slug regeneration if question changed)
    await faq.save();

    res.status(200).json({
      status: "success",
      data: {
        faq,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/v1/faqs/:slug
// @access  Private/Admin
exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findOneAndDelete({ slug: req.params.slug });

    if (!faq) {
      return next(new AppError("No FAQ found with that slug", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark FAQ as helpful
// @route   POST /api/v1/faqs/:slug/helpful
// @access  Public
exports.markHelpful = async (req, res, next) => {
  try {
    const faq = await FAQ.findOne({ slug: req.params.slug });

    if (!faq) {
      return next(new AppError("No FAQ found with that slug", 404));
    }

    await faq.markHelpful();

    res.status(200).json({
      status: "success",
      data: {
        helpfulCount: faq.helpfulCount,
        notHelpfulCount: faq.notHelpfulCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark FAQ as not helpful
// @route   POST /api/v1/faqs/:slug/not-helpful
// @access  Public
exports.markNotHelpful = async (req, res, next) => {
  try {
    const faq = await FAQ.findOne({ slug: req.params.slug });

    if (!faq) {
      return next(new AppError("No FAQ found with that slug", 404));
    }

    await faq.markNotHelpful();

    res.status(200).json({
      status: "success",
      data: {
        helpfulCount: faq.helpfulCount,
        notHelpfulCount: faq.notHelpfulCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get FAQs by category
// @route   GET /api/v1/faqs/category/:category
// @access  Public
exports.getFAQsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const faqs = await FAQ.getByCategory(category);

    res.status(200).json({
      status: "success",
      results: faqs.length,
      data: {
        faqs,
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular FAQs
// @route   GET /api/v1/faqs/popular
// @access  Public
exports.getPopularFAQs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const faqs = await FAQ.getPopular(limit);

    res.status(200).json({
      status: "success",
      results: faqs.length,
      data: {
        faqs,
      },
    });
  } catch (err) {
    next(err);
  }
};
