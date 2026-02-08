const AboutPage = require("../models/AboutPage");

exports.getAboutPage = async (req, res, next) => {
  try {
    // Get the published about page
    const aboutPage = await AboutPage.findOne({ isPublished: true })
      .populate("updatedBy", "name email")
      .select("-__v");

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    // Filter active items only
    const filteredAboutPage = {
      ...aboutPage.toObject(),
      teamMembers: aboutPage.teamMembers
        .filter((member) => member.isActive)
        .sort((a, b) => a.order - b.order),
      achievements: aboutPage.achievements
        .filter((achievement) => achievement.isActive)
        .sort((a, b) => a.order - b.order),
      brandLogos: aboutPage.brandLogos
        .filter((logo) => logo.isActive)
        .sort((a, b) => a.order - b.order),
    };

    res.status(200).json({
      status: "success",
      data: {
        aboutPage: filteredAboutPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// ADMIN CONTROLLERS
exports.getAllAboutPages = async (req, res, next) => {
  try {
    // Basic filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let query = AboutPage.find(queryObj).populate("updatedBy", "name email");

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const aboutPages = await query;

    // Count total documents
    const total = await AboutPage.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      results: aboutPages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        aboutPages,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createAboutPage = async (req, res, next) => {
  try {
    // Check if there's already a published about page
    if (req.body.isPublished) {
      const existingPublished = await AboutPage.findOne({
        isPublished: true,
      });
      if (existingPublished) {
        return res.status(400).json({
          status: "fail",
          message: "There is already a published about page",
        });
      }
    }

    const aboutPage = await AboutPage.create({
      ...req.body,
      updatedBy: req.user.id,
      lastUpdated: Date.now(),
    });

    res.status(201).json({
      status: "success",
      data: {
        aboutPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateAboutPage = async (req, res, next) => {
  try {
    if (req.body.isPublished) {
      // If publishing this page, unpublish others
      await AboutPage.updateMany(
        { _id: { $ne: req.params.id } },
        { isPublished: false }
      );
    }

    const aboutPage = await AboutPage.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id,
        lastUpdated: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("updatedBy", "name email");

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        aboutPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteAboutPage = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findByIdAndDelete(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

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

// TEAM MEMBER MANAGEMENT
exports.addTeamMember = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.teamMembers.push(req.body);
    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();

    await aboutPage.save();

    const newMember = aboutPage.teamMembers[aboutPage.teamMembers.length - 1];

    res.status(201).json({
      status: "success",
      data: {
        teamMember: newMember,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateTeamMember = async (req, res, next) => {
  try {
    const { teamMemberId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const teamMemberIndex = aboutPage.teamMembers.findIndex(
      (member) => member._id.toString() === teamMemberId
    );

    if (teamMemberIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Team member not found",
      });
    }

    aboutPage.teamMembers[teamMemberIndex] = {
      ...aboutPage.teamMembers[teamMemberIndex].toObject(),
      ...req.body,
    };

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

    res.status(200).json({
      status: "success",
      data: {
        teamMember: aboutPage.teamMembers[teamMemberIndex],
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteTeamMember = async (req, res, next) => {
  try {
    const { teamMemberId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.teamMembers = aboutPage.teamMembers.filter(
      (member) => member._id.toString() !== teamMemberId
    );

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

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

// ACHIEVEMENT MANAGEMENT
exports.addAchievement = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.achievements.push(req.body);
    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();

    await aboutPage.save();

    const newAchievement =
      aboutPage.achievements[aboutPage.achievements.length - 1];

    res.status(201).json({
      status: "success",
      data: {
        achievement: newAchievement,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateAchievement = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const achievementIndex = aboutPage.achievements.findIndex(
      (achievement) => achievement._id.toString() === achievementId
    );

    if (achievementIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Achievement not found",
      });
    }

    aboutPage.achievements[achievementIndex] = {
      ...aboutPage.achievements[achievementIndex].toObject(),
      ...req.body,
    };

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

    res.status(200).json({
      status: "success",
      data: {
        achievement: aboutPage.achievements[achievementIndex],
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteAchievement = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.achievements = aboutPage.achievements.filter(
      (achievement) => achievement._id.toString() !== achievementId
    );

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

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

// BRAND LOGO MANAGEMENT
exports.addBrandLogo = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.brandLogos.push(req.body);
    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();

    await aboutPage.save();

    const newBrandLogo = aboutPage.brandLogos[aboutPage.brandLogos.length - 1];

    res.status(201).json({
      status: "success",
      data: {
        brandLogo: newBrandLogo,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateBrandLogo = async (req, res, next) => {
  try {
    const { brandLogoId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const brandLogoIndex = aboutPage.brandLogos.findIndex(
      (logo) => logo._id.toString() === brandLogoId
    );

    if (brandLogoIndex === -1) {
      return res.status(404).json({
        status: "fail",
        message: "Brand logo not found",
      });
    }

    aboutPage.brandLogos[brandLogoIndex] = {
      ...aboutPage.brandLogos[brandLogoIndex].toObject(),
      ...req.body,
    };

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

    res.status(200).json({
      status: "success",
      data: {
        brandLogo: aboutPage.brandLogos[brandLogoIndex],
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteBrandLogo = async (req, res, next) => {
  try {
    const { brandLogoId } = req.params;
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    aboutPage.brandLogos = aboutPage.brandLogos.filter(
      (logo) => logo._id.toString() !== brandLogoId
    );

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

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

// Get specific items (useful for frontend)
exports.getTeamMembers = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findOne({ isPublished: true })
      .select("teamMembers")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const teamMembers = aboutPage.teamMembers
      .filter((member) => member.isActive)
      .sort((a, b) => a.order - b.order);

    res.status(200).json({
      status: "success",
      data: {
        teamMembers,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAchievements = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findOne({ isPublished: true })
      .select("achievements")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const achievements = aboutPage.achievements
      .filter((achievement) => achievement.isActive)
      .sort((a, b) => a.order - b.order);

    res.status(200).json({
      status: "success",
      data: {
        achievements,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBrandLogos = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findOne({ isPublished: true })
      .select("brandLogos")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    const brandLogos = aboutPage.brandLogos
      .filter((logo) => logo.isActive)
      .sort((a, b) => a.order - b.order);

    res.status(200).json({
      status: "success",
      data: {
        brandLogos,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAgencyInfo = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findOne({ isPublished: true })
      .select("agencyInfo")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        agencyInfo: aboutPage.agencyInfo,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// About Controller additions
exports.updateOrder = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const { items } = req.body;

    const aboutPage = await AboutPage.findById(id);
    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    // Update order based on type
    if (type === "team") {
      aboutPage.teamMembers = items;
    } else if (type === "achievements") {
      aboutPage.achievements = items;
    } else if (type === "brands") {
      aboutPage.brandLogos = items;
    }

    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

    res.status(200).json({
      status: "success",
      data: { aboutPage },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.toggleActiveStatus = async (req, res, next) => {
  try {
    const { id, type, itemId } = req.params;
    const aboutPage = await AboutPage.findById(id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    let items;
    if (type === "team") {
      items = aboutPage.teamMembers;
    } else if (type === "achievements") {
      items = aboutPage.achievements;
    } else if (type === "brands") {
      items = aboutPage.brandLogos;
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid type",
      });
    }

    const item = items.id(itemId);
    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Item not found",
      });
    }

    item.isActive = !item.isActive;
    aboutPage.updatedBy = req.user.id;
    aboutPage.lastUpdated = Date.now();
    await aboutPage.save();

    res.status(200).json({
      status: "success",
      data: { item },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Add these functions to your aboutController.js

exports.duplicateAboutPage = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id);

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    // Create a copy of the about page
    const duplicatedPage = await AboutPage.create({
      ...aboutPage.toObject(),
      _id: undefined,
      agencyInfo: {
        ...aboutPage.agencyInfo,
        name: `${aboutPage.agencyInfo.name} (Copy)`,
      },
      isPublished: false,
      updatedBy: req.user.id,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    res.status(201).json({
      status: "success",
      data: {
        aboutPage: duplicatedPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.exportAboutPage = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id)
      .populate("updatedBy", "name email")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    // Remove MongoDB specific fields
    const exportData = {
      ...aboutPage,
      _id: undefined,
      __v: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      updatedBy: aboutPage.updatedBy ? aboutPage.updatedBy._id : undefined,
    };

    res.status(200).json({
      status: "success",
      data: {
        export: exportData,
        exportedAt: new Date().toISOString(),
        format: "JSON",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.importAboutPage = async (req, res, next) => {
  try {
    const importData = req.body;

    if (!importData || !importData.agencyInfo) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid import data",
      });
    }

    // Check if there's already a published about page with this name
    if (importData.isPublished) {
      const existingPublished = await AboutPage.findOne({
        "agencyInfo.name": importData.agencyInfo.name,
        isPublished: true,
      });

      if (existingPublished) {
        return res.status(400).json({
          status: "fail",
          message: "A published about page with this name already exists",
        });
      }
    }

    // Create new about page from import data
    const newAboutPage = await AboutPage.create({
      ...importData,
      isPublished: false, // Always import as draft
      updatedBy: req.user.id,
      lastUpdated: Date.now(),
    });

    res.status(201).json({
      status: "success",
      data: {
        aboutPage: newAboutPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAboutPageWithDetails = async (req, res, next) => {
  try {
    const aboutPage = await AboutPage.findById(req.params.id)
      .populate("updatedBy", "name email")
      .lean();

    if (!aboutPage) {
      return res.status(404).json({
        status: "fail",
        message: "About page not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        aboutPage,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
