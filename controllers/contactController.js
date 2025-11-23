const Contact = require("../models/Contact");
const AppError = require("../utils/appError");

// @desc    Create or update contact information (singleton pattern)
// @route   POST /api/v1/contact
// @access  Private/Admin
exports.createOrUpdateContact = async (req, res, next) => {
  try {
    const { email, phone, address, socialLinks, isActive = true } = req.body;

    // 1) Check if contact info already exists
    let existingContact = await Contact.findOne();

    if (existingContact) {
      // Update existing contact
      if (email) existingContact.email = email;
      if (phone) existingContact.phone = phone;
      if (address) {
        existingContact.address = { ...existingContact.address, ...address };
      }
      if (socialLinks) {
        existingContact.socialLinks = {
          ...existingContact.socialLinks,
          ...socialLinks,
        };
      }
      if (isActive !== undefined) existingContact.isActive = isActive;

      await existingContact.save();

      return res.status(200).json({
        status: "success",
        data: {
          contact: existingContact,
        },
      });
    }

    // 2) Create new contact if none exists
    const contact = await Contact.create({
      email,
      phone,
      address,
      socialLinks,
      isActive,
    });

    res.status(201).json({
      status: "success",
      data: {
        contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get contact information
// @route   GET /api/v1/contact
// @access  Public
exports.getContactInfo = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ isActive: true });

    // Return empty object instead of error if no contact found
    if (!contact) {
      return res.status(200).json({
        status: "success",
        data: {
          contact: null, // or {} for empty object
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact entries (for admin)
// @route   GET /api/v1/contact/all
// @access  Private/Admin
exports.getAllContactEntries = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    // Always return success with empty array if no contacts
    res.status(200).json({
      status: "success",
      results: contacts.length,
      data: {
        contacts: contacts || [], // Ensure it's always an array
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact information
// @route   PATCH /api/v1/contact
// @access  Private/Admin
exports.updateContact = async (req, res, next) => {
  try {
    const { email, phone, address, socialLinks, isActive } = req.body;

    // 1) Find active contact
    let contact = await Contact.findOne();

    // If no contact exists, create a new one instead of returning error
    if (!contact) {
      // Create new contact with provided data
      contact = await Contact.create({
        email: email || "",
        phone: phone || "",
        address: address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
        },
        socialLinks: socialLinks || {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
          youtube: "",
        },
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(201).json({
        status: "success",
        data: {
          contact,
        },
      });
    }

    // 2) Update fields if contact exists
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (address) {
      contact.address = { ...contact.address, ...address };
    }
    if (socialLinks) {
      contact.socialLinks = { ...contact.socialLinks, ...socialLinks };
    }
    if (isActive !== undefined) contact.isActive = isActive;

    // 3) Save changes
    await contact.save();

    res.status(200).json({
      status: "success",
      data: {
        contact,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contact information
// @route   DELETE /api/v1/contact
// @access  Private/Admin
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete();

    // Return success even if no contact was found to delete
    if (!contact) {
      return res.status(200).json({
        status: "success",
        message: "No contact information found to delete",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Contact information deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get contact information with fallback (public route)
// @route   GET /api/v1/contact/public
// @access  Public
exports.getPublicContactInfo = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ isActive: true });

    // Return default empty structure instead of error
    const defaultContact = {
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      socialLinks: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        youtube: "",
      },
      isActive: false,
    };

    res.status(200).json({
      status: "success",
      data: {
        contact: contact || defaultContact,
      },
    });
  } catch (err) {
    next(err);
  }
};
