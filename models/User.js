const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  // Security question fields
  securityQuestion: {
    question: {
      type: String,
      required: false, // Will be required after first setup
    },
    answer: {
      type: String,
      required: false,
      select: false,
    },
  },
  // Add tokenVersion field
  tokenVersion: {
    type: Number,
    default: 0,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Encrypt security answer before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("securityQuestion.answer")) return next();
  if (this.securityQuestion.answer) {
    this.securityQuestion.answer = await bcrypt.hash(
      this.securityQuestion.answer,
      12
    );
  }
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare security answers
userSchema.methods.compareSecurityAnswer = async function (enteredAnswer) {
  if (!this.securityQuestion.answer) {
    return false;
  }
  return await bcrypt.compare(enteredAnswer, this.securityQuestion.answer);
};

// Add this method for password reset tokens
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
