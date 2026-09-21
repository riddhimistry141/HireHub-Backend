const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const resumeUpload = require("../middleware/resumeUpload");

const resumeController = require("../controllers/resumeController");

router.post(
    "/",
    authMiddleware,
    authorizeRoles("USER"),
    resumeUpload.single("resume"),
    resumeController.uploadResume
);

router.get(
    "/",
    authMiddleware,
    authorizeRoles("USER"),
    resumeController.getMyResume
);

router.get(
    "/download",
    authMiddleware,
    authorizeRoles("USER"),
    resumeController.downloadResume
);

router.delete(
    "/",
    authMiddleware,
    authorizeRoles("USER"),
    resumeController.deleteResume
);

module.exports = router;