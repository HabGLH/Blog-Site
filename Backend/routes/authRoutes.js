import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", protect, verifyUser);
router.put("/profile", protect, updateProfile);

export default router;
