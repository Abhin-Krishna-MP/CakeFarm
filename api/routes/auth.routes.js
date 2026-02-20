import express from "express";
import passport from "../config/passport.js";
import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    // Generate access token
    const accessToken = await UserModel.generateAccessToken(req.user);
    
    // Prepare user object without sensitive data
    const userObject = {
      userId: req.user.userId,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      profilePic: req.user.profilePic,
      registerNumber: req.user.registerNumber,
      department: req.user.department,
      semester: req.user.semester,
      division: req.user.division,
    };
    
    // Redirect to frontend with user data
    // Check if user has completed profile
    if (!req.user.registerNumber || !req.user.department) {
      // Redirect to profile completion page
      res.redirect(
        `http://localhost:5173/complete-profile?token=${accessToken}&userId=${req.user.userId}`
      );
    } else {
      // Redirect to home with token
      res.redirect(
        `http://localhost:5173/auth/success?token=${accessToken}&user=${encodeURIComponent(
          JSON.stringify(userObject)
        )}`
      );
    }
  }
);

// Update user profile with additional details
router.post(
  "/complete-profile",
  asyncHandler(async (req, res) => {
    const { userId, registerNumber, department, semester, division } = req.body;

    if (!userId || !registerNumber || !department || !semester || !division) {
      throw new ApiError(400, "All fields are required");
    }

    const updatedUser = await UserModel.updateUser(userId, {
      registerNumber,
      department,
      semester,
      division,
    });

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await UserModel.generateAccessToken(updatedUser);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: updatedUser, accessToken },
          "Profile completed successfully"
        )
      );
  })
);

// Get current authenticated user
router.get(
  "/current-user",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user: req.user }, "User retrieved successfully"));
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173");
  });
});

export default router;
