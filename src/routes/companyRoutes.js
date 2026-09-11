const express = require("express");

const companyController = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ========================================
// Create Company
// ========================================

router.post(
    "/",
    authMiddleware,
    authorizeRoles("RECRUITER"),
    companyController.createCompany
);


// ========================================
// Get My Company
// ========================================

router.get(
    "/",
    authMiddleware,
    authorizeRoles("RECRUITER"),
    companyController.getMyCompany
);


// ========================================
// Update My Company
// ========================================

router.patch(
    "/",
    authMiddleware,
    authorizeRoles("RECRUITER"),
    companyController.updateCompany
);


// ========================================
// Delete My Company
// ========================================

router.delete(
    "/",
    authMiddleware,
    authorizeRoles("RECRUITER"),
    companyController.deleteCompany
);


module.exports = router;