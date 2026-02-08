const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter team member name"],
  },
  role: {
    type: String,
    required: [true, "Please enter team member role"],
  },
  front: {
    image: {
      type: String,
      required: [true, "Please provide team member image URL"],
    },
    specialty: {
      type: String,
      required: [true, "Please enter team member specialty"],
    },
    icon: {
      type: String,
      required: [true, "Please provide icon name"],
    },
  },
  back: {
    quote: {
      type: String,
      required: [true, "Please provide team member quote"],
    },
    bio: {
      type: String,
      required: [true, "Please provide team member bio"],
    },
    social: [
      {
        platform: {
          type: String,
          enum: [
            "linkedin",
            "twitter",
            "instagram",
            "facebook",
            "youtube",
            "behance",
            "github",
            "website",
          ],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter achievement title"],
  },
  description: {
    type: String,
    required: [true, "Please enter achievement description"],
  },
  year: {
    type: String,
    required: [true, "Please enter achievement year"],
  },
  icon: {
    type: String,
    required: [true, "Please provide icon name"],
  },
  image: {
    type: String,
    required: [true, "Please provide achievement image URL"],
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const brandLogoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter brand name"],
  },
  logo: {
    type: String,
    required: [true, "Please provide brand logo URL"],
  },
  website: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const agencyInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter agency name"],
    default: "VisionCraft",
  },
  tagline: {
    type: String,
    default: "We Craft Visual Stories",
  },
  description: {
    type: String,
    required: [true, "Please enter agency description"],
  },
  foundedYear: {
    type: Number,
    required: [true, "Please enter founding year"],
    default: 2015,
  },
  mission: {
    type: String,
  },
  vision: {
    type: String,
  },
  values: [String],
  heroImage: {
    type: String,
    required: [true, "Please provide hero image URL"],
  },
  socialLinks: [
    {
      platform: {
        type: String,
        enum: [
          "linkedin",
          "twitter",
          "instagram",
          "facebook",
          "youtube",
          "behance",
          "github",
          "website",
        ],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        required: true,
      },
    },
  ],
  contactEmail: {
    type: String,
    required: [true, "Please provide contact email"],
  },
  contactPhone: {
    type: String,
  },
  address: {
    type: String,
  },
  stats: [
    {
      label: String,
      value: String,
      icon: String,
    },
  ],
});

const aboutPageSchema = new mongoose.Schema(
  {
    agencyInfo: agencyInfoSchema,
    teamMembers: [teamMemberSchema],
    achievements: [achievementSchema],
    brandLogos: [brandLogoSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
aboutPageSchema.index({ isPublished: 1 });
aboutPageSchema.index({ "teamMembers.isActive": 1 });
aboutPageSchema.index({ "achievements.isActive": 1 });
aboutPageSchema.index({ "brandLogos.isActive": 1 });

module.exports = mongoose.model("AboutPage", aboutPageSchema);
