const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        maxlength: [100, "Street address cannot exceed 100 characters"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [50, "State name cannot exceed 50 characters"],
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
        trim: true,
        maxlength: [20, "ZIP code cannot exceed 20 characters"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        default: "United States",
      },
    },
    socialLinks: {
      facebook: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?facebook\.com\/.+$/,
          "Please enter a valid Facebook URL",
        ],
      },
      twitter: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?twitter\.com\/.+$/,
          "Please enter a valid Twitter URL",
        ],
      },
      instagram: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?instagram\.com\/.+$/,
          "Please enter a valid Instagram URL",
        ],
      },
      linkedin: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/.+$/,
          "Please enter a valid LinkedIn URL",
        ],
      },
      youtube: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?youtube\.com\/.+$/,
          "Please enter a valid YouTube URL",
        ],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent multiple contact entries (singleton pattern)
contactSchema.statics.getContactInfo = function () {
  return this.findOne().sort({ createdAt: -1 });
};

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
