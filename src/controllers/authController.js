const authService = require("../services/authService");

// Register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      roleName,
    } = req.body;

    // Required fields
    if (!name || !email || !password || !roleName) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // Prepare registration data
    const registrationData = {
      name,
      email,
      password,
      roleName,
    };

    const result = await authService.registerUser(
      registrationData
    );

    const message =
      roleName === "RECRUITER"
        ? "Recruiter profile created successfully. Wait for admin approval."
        : "User registered successfully";

    return res.status(201).json({
      success: true,
      message,
      data: result.data,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter account already registered" ||
      error.message === "Email already registered as user" ||
      error.message === "Email already registered"
    ) {
      statusCode = 409;
    }

    if (error.message === "Invalid registration role") {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Prepare login data
    const loginData = {
      email,
      password,
    };

    const result = await authService.loginUser(
      loginData
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result.data,
      token: result.token,
    });
  } catch (error) {
    let statusCode = 401;

    if (
      error.message ===
        "Recruiter profile is pending approval" ||
      error.message ===
        "Recruiter profile was rejected"
    ) {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};