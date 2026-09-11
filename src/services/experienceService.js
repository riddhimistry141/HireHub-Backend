const prisma = require("../config/prisma");

const getAllExperiences = async () => {
  return await prisma.experience.findMany({
    orderBy: {
      experienceName: "asc",
    },
  });
};

module.exports = {
  getAllExperiences,
};