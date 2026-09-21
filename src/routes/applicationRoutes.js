const express = require("express");

const applicationController = require("../controllers/applicationController");
const recruiterApplicationController = require("../controllers/recruiterApplicationController")

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Apply for a job
router.post(
  "/",
  authMiddleware,
  authorizeRoles("USER"),
  applicationController.createApplication
);


// Get logged-in user's applications
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("USER"),
  applicationController.getMyApplications
);

//recruiter
router.get(
  "/recruiter",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  applicationController.getRecruiterApplications
);

router.get(
  "/recruiter/interviews",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  recruiterApplicationController.getRecruiterInterviews
);

router.patch(
  "/recruiter/interviews/:id/status",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  recruiterApplicationController.updateInterviewStatus
);

router.get(
    "/recruiter/:id/resume",
    authMiddleware,
    authorizeRoles("RECRUITER"),
    recruiterApplicationController.downloadRecruiterApplicationResume
);

router.get(
  "/recruiter/:id",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  applicationController.getRecruiterApplicationById
);

router.patch(
  "/recruiter/:id/status",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  applicationController.updateRecruiterApplicationStatus
);

router.post(
  "/recruiter/:id/interview",
  authMiddleware,
  authorizeRoles("RECRUITER"),
  recruiterApplicationController.scheduleInterview
);







// Get one of user's applications
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("USER"),
  applicationController.getApplicationById
);


// Withdraw application
router.patch(
  "/:id/withdraw",
  authMiddleware,
  authorizeRoles("USER"),
  applicationController.withdrawApplication
);





module.exports = router;