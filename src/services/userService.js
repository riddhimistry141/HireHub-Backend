const prisma = require("../config/prisma");

// Get user by ID
const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
    },
  });
};

// Get user by email
const getUserByEmail = async (email) => {
  return await prisma.auth.findUnique({
    where: {
      email,
    },

    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });
};

module.exports = {
  getUserById,
  getUserByEmail,
};