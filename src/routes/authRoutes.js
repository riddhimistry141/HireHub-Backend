const express = require("express");
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

/* router.get(
    "/recruiters/pending",
    authMiddleware,
    authorizeRoles("ADMIN"),
    adminController.getPendingRecruiters
); */

router.get("/test", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "JWT authentication working",
        user: req.user,
    });
});


module.exports = router;
