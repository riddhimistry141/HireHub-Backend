const experienceService = require("../services/experienceService");

const getAllExperiences = async (req, res) => {
  try {
    const experiences = await experienceService.getAllExperiences();

    return res.status(200).json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
};

module.exports = {
  getAllExperiences,
};