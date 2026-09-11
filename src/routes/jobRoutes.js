const express = require("express");

const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// =========================
// Recruiter Routes
// =========================

router.get(
  "/my",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  jobController.getMyJobs
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  jobController.createJob
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  jobController.updateJob
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  jobController.deleteJob
);


// =========================
// Public Routes
// =========================

router.get("/", jobController.getAllJobs);

router.get("/:id", jobController.getJobById);


module.exports = router;