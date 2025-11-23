const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const signToken = (id, tokenVersion) => {
  return jwt.sign(
    {
      id,
      version: tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.tokenVersion);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.securityQuestion.answer = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // 3) Increment token version to generate new token
    user.tokenVersion += 1;
    await user.save();

    // 4) Remove sensitive data and send response
    const responseUser = user.toObject();
    delete responseUser.password;
    delete responseUser.securityQuestion.answer;

    res.status(200).json({
      status: "success",
      token: signToken(user._id, user.tokenVersion),
      data: {
        user: responseUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Set or update security question with password requirement for first-time setup
exports.setSecurityQuestion = async (req, res, next) => {
  try {
    const { question, answer, currentPassword } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both question and answer",
      });
    }

    // 1) Get user
    const user = await User.findById(req.user.id);

    // 2) Check if user already has a security question set
    const hasExistingQuestion =
      user.securityQuestion &&
      user.securityQuestion.question &&
      user.securityQuestion.answer;

    // 3) If this is the FIRST TIME setting security question, require password
    if (!hasExistingQuestion) {
      if (!currentPassword) {
        return res.status(400).json({
          status: "fail",
          message:
            "Current password is required to set security question for the first time",
        });
      }

      // Verify current password
      const userWithPassword = await User.findById(req.user.id).select(
        "+password"
      );
      if (!(await userWithPassword.comparePassword(currentPassword))) {
        return res.status(401).json({
          status: "fail",
          message: "Current password is incorrect",
        });
      }
    }

    // 4) If UPDATING existing question, no password required
    // Update security question
    user.securityQuestion = {
      question,
      answer,
    };

    // 5) Increment token version for security
    user.tokenVersion += 1;
    await user.save();

    // Remove sensitive data
    user.password = undefined;
    user.securityQuestion.answer = undefined;

    res.status(200).json({
      status: "success",
      message: hasExistingQuestion
        ? "Security question updated successfully"
        : "Security question set successfully",
      token: signToken(user._id, user.tokenVersion), // ← Add this line
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get security question for password reset (public endpoint)
exports.getSecurityQuestion = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (!user.securityQuestion || !user.securityQuestion.question) {
      return res.status(400).json({
        status: "fail",
        message: "Security question not set for this user",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        securityQuestion: user.securityQuestion.question,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Verify security question for password reset
exports.verifySecurityQuestion = async (req, res, next) => {
  try {
    const { email, answer } = req.body;

    if (!email || !answer) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and security answer",
      });
    }

    // 1) Get user with security answer
    const user = await User.findOne({ email }).select(
      "+securityQuestion.answer"
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // 2) Check if security question is set
    if (!user.securityQuestion || !user.securityQuestion.question) {
      return res.status(400).json({
        status: "fail",
        message: "Security question not set for this user",
      });
    }

    // 3) Verify security answer
    if (!(await user.compareSecurityAnswer(answer))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect security answer",
      });
    }

    // 4) Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Security answer verified successfully",
      resetToken,
      securityQuestion: user.securityQuestion.question,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Reset password with security question
exports.resetPasswordWithSecurity = async (req, res, next) => {
  try {
    const { token, newPassword, answer } = req.body;

    if (!token || !newPassword || !answer) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please provide reset token, new password, and security answer",
      });
    }

    // 1) Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+securityQuestion.answer");

    // 2) If token has not expired, and there is user
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    // 3) Verify security answer again for extra security
    if (!(await user.compareSecurityAnswer(answer))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect security answer",
      });
    }

    // 4) Update password and invalidate all previous tokens
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1; // Invalidate all previous JWTs
    await user.save();

    // 5) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    // 4) Check if token version matches
    if (decoded.version !== currentUser.tokenVersion) {
      return res.status(401).json({
        status: "fail",
        message: "Token is no longer valid. Please log in again.",
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if current password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: "fail",
        message: "Your current password is wrong.",
      });
    }

    // 3) Update password and increment token version
    user.password = req.body.newPassword;
    user.tokenVersion += 1;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = req.user;

    res.status(200).json({
      status: "success",
      data: {
        user: currentUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();

    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a token to verify",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist.",
        isValid: false,
      });
    }

    if (decoded.version !== currentUser.tokenVersion) {
      return res.status(401).json({
        status: "fail",
        message: "Token is no longer valid. Please log in again.",
        isValid: false,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Token is valid",
      isValid: true,
      data: {
        user: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
        },
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Token is invalid or expired",
      isValid: false,
      error: err.message,
    });
  }
};
