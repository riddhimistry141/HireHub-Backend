const prisma = require("../config/prisma");

// ========================================
// Get Company By Recruiter
// ========================================

const getCompanyByRecruiterId = async (recruiterId) => {
  return await prisma.company.findUnique({
    where: {
      recruiterId,
    },
  });
};

// ========================================
// Create Company
// ========================================

const createCompany = async (companyData) => {
  const existingCompany = await getCompanyByRecruiterId(
    companyData.recruiterId
  );

  if (existingCompany) {
    throw new Error("Company already exists");
  }

  return await prisma.company.create({
    data: companyData,
  });
};

// ========================================
// Get My Company
// ========================================

const getMyCompany = async (recruiterId) => {
  const company = await prisma.company.findUnique({
    where: {
      recruiterId,
    },
    include: {
      jobs: true,
    },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
};

// ========================================
// Update My Company
// ========================================

const updateCompany = async (recruiterId, companyData) => {
  const company = await getCompanyByRecruiterId(recruiterId);

  if (!company) {
    throw new Error("Company not found");
  }

  return await prisma.company.update({
    where: {
      id: company.id,
    },
    data: companyData,
  });
};

// ========================================
// Delete My Company
// ========================================

const deleteCompany = async (recruiterId) => {
  const company = await getCompanyByRecruiterId(recruiterId);

  if (!company) {
    throw new Error("Company not found");
  }

  return await prisma.company.delete({
    where: {
      id: company.id,
    },
  });
};

module.exports = {
  createCompany,
  getMyCompany,
  updateCompany,
  deleteCompany,
};