const express = require("express");

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ========================================
// All Recruiters
// ========================================

router.get(
  "/recruiters",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getAllRecruiters,
);

// ========================================
// Recruiter Details
// ========================================

router.get(
  "/recruiters/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getRecruiterDetails
);

// ========================================
// Pending Recruiters
// ========================================

router.get(
  "/recruiters/pending",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getPendingRecruiters,
);



// ========================================
// Approve Recruiter
// ========================================

router.patch(
  "/recruiters/:id/approve",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.approveRecruiter,
);

// ========================================
// Reject Recruiter
// ========================================

router.patch(
  "/recruiters/:id/reject",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.rejectRecruiter,
);

// ========================================
// Suspend Recruiter
// ========================================

router.patch(
  "/recruiters/:id/suspend",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.suspendRecruiter,
);

//admin get job from recruiter (jobservice)
router.get(
  "/jobs",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getAllJobs,
);

router.get(
  "/jobs/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.getJobById,
);

router.patch(
  "/jobs/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  adminController.updateJobStatus,
);

module.exports = router;
