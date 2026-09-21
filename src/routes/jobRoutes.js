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

router.get(
  "/recruiter/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  jobController.getRecruiterJobById
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

//====user======

router.post(
  "/:jobId/save",
  authMiddleware,
  authorizeRoles("USER"),
  jobController.toggleSaveJob
);

router.get(
  "/saved",
  authMiddleware,
  authorizeRoles("USER"),
  jobController.getSavedJobs
);

router.get(
  "/:jobId/saved",
  authMiddleware,
  authorizeRoles("USER"),
  jobController.getSavedJobStatus
);


// =========================
// Public Routes
// =========================

router.get("/", jobController.getAllJobs);

router.get("/:id", jobController.getJobById);


module.exports = router;