const Category = require("../models/Category");
const AppError = require("../utils/appError"); // Optional for advanced error handling

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, isShownInCategory = true } = req.body;

    // 1) Check for duplicate name
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new AppError("Category with this name already exists", 400));
    }

    // 2) Create category (slug auto-generated via pre-save hook)
    const category = await Category.create({
      name,
      isShownInCategory,
    });

    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    // 1) Filtering
    const filter = {};
    if (req.query.isShownInCategory) {
      filter.isShownInCategory = req.query.isShownInCategory === "true";
    }

    // 2) Sorting (default: alphabetical)
    const sortBy = req.query.sort || "name";

    // 3) Execute query
    const categories = await Category.find(filter).sort(sortBy);

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return next(new AppError("No category found with that slug", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PATCH /api/v1/categories/:slug
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, isShownInCategory } = req.body;

    // 1) Find category
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return next(new AppError("No category found with that slug", 404));
    }

    // 2) Check for duplicate name if name is being updated
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return next(
          new AppError("Category with this name already exists", 400)
        );
      }
    }

    // 3) Update fields
    if (name) category.name = name;
    if (isShownInCategory !== undefined) {
      category.isShownInCategory = isShownInCategory;
    }

    // 4) Save (triggers slug regeneration if name changed)
    await category.save();

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:slug
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return next(new AppError("No category found with that slug", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
