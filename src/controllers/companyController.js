const companyService = require("../services/companyService");

// ========================================
// Create Company
// ========================================

const createCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const {
      name,
      description,
      website,
      logo,
      location,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const companyData = {
      name,
      description,
      website,
      logo,
      location,
      recruiterId,
    };

    const company = await companyService.createCompany(companyData);

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error("Create company error:", error);

    if (error.message === "Company already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create company",
    });
  }
};

// ========================================
// Get My Company
// ========================================

const getMyCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const company = await companyService.getMyCompany(recruiterId);

    return res.status(200).json({
      success: true,
      message: "Company fetched successfully",
      data: company,
    });
  } catch (error) {
    console.error("Get company error:", error);

    if (error.message === "Company not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company",
    });
  }
};

// ========================================
// Update My Company
// ========================================

const updateCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const {
      name,
      description,
      website,
      logo,
      location,
    } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot be empty",
      });
    }

    const companyData = {
      name,
      description,
      website,
      logo,
      location,
    };

    const company = await companyService.updateCompany(
      recruiterId,
      companyData
    );

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("Update company error:", error);

    if (error.message === "Company not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update company",
    });
  }
};

// ========================================
// Delete My Company
// ========================================

const deleteCompany = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    await companyService.deleteCompany(recruiterId);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Delete company error:", error);

    if (error.message === "Company not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete company",
    });
  }
};

module.exports = {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
};