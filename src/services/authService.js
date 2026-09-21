const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const userService = require("../services/userService");

const registerUser = async (registrationData) => {
  const {
    name,
    email,
    password,
    roleName,
  } = registrationData;

  const normalizedEmail = email.trim().toLowerCase();

  // Check whether email already exists
  const existingUser = await userService.getUserByEmail(normalizedEmail);

  if (existingUser) {
    const existingRole = existingUser.user?.role?.roleName;

    if (existingRole === "RECRUITER") {
      throw new Error("Recruiter account already registered");
    }

    if (existingRole === "USER") {
      throw new Error("Email already registered as user");
    }

    if (existingRole === "ADMIN") {
      throw new Error("Email already registered");
    }

    throw new Error("Email already registered");
  }

  // Frontend can only register USER or RECRUITER
  if (roleName !== "USER" && roleName !== "RECRUITER") {
    throw new Error("Invalid registration role");
  }

  // Find role
  const role = await prisma.role.findUnique({
    where: {
      roleName,
    },
  });

  if (!role) {
    throw new Error(`${roleName} role not found`);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // User registration is active immediately
  // Recruiter registration needs admin approval
  const status = roleName === "RECRUITER"
    ? "PENDING"
    : "ACTIVE";

  const auth = await prisma.auth.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,

      user: {
        create: {
          name: name.trim(),
          roleId: role.id,
          status,
        },
      },
    },

    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  return {
    data: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.email,
      roleName: auth.user.role.roleName,
      status: auth.user.status,
    },
  };
};

const loginUser = async (loginData) => {
  const {
    email,
    password,
  } = loginData;

  const normalizedEmail = email.trim().toLowerCase();

  // Find account by email
  const auth = await prisma.auth.findUnique({
    where: {
      email: normalizedEmail,
    },

    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!auth) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(
    password,
    auth.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const user = auth.user;
  const roleName = user.role.roleName;
  const status = user.status;

  // Suspended account
  if (status === "SUSPENDED") {
    throw new Error("Invalid email or password");
  }

  // Recruiter status handling
  if (roleName === "RECRUITER") {
    if (status === "PENDING") {
      throw new Error("Recruiter profile is pending approval");
    }

    if (status === "REJECTED") {
      throw new Error("Recruiter profile was rejected");
    }

    if (status !== "APPROVED") {
      throw new Error("Invalid email or password");
    }
  }

  // User status handling
  if (roleName === "USER") {
    if (status !== "ACTIVE") {
      throw new Error("Invalid email or password");
    }
  }

  // Admin status handling
  if (roleName === "ADMIN") {
    if (status !== "ACTIVE") {
      throw new Error("Invalid email or password");
    }
  }

  // JWT
  const token = jwt.sign(
    {
      id: user.id,
      roleName,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    data: {
      id: user.id,
      name: user.name,
      email: auth.email,
      roleName,
      status,
    },

    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};