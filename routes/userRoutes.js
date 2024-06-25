const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUserFromToken,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.get("/token", isAuthenticated, getUserFromToken);
module.exports = router;
