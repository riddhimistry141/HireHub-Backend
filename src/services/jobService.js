const prisma = require("../config/prisma");

const getCompanyByRecruiterId = async (recruiterId) => {
  return await prisma.company.findUnique({
    where: {
      recruiterId,
    },
  });
};

const getRecruiterCompany = async (recruiterId) => {
  const company = await getCompanyByRecruiterId(recruiterId);

  if (!company) {
    throw new Error(
      "Company not found. Create your company profile first."
    );
  }

  return company;
};

const validateExperience = async (experienceId) => {
  if (!experienceId) {
    return;
  }

  const experience = await prisma.experience.findUnique({
    where: {
      id: experienceId,
    },
  });

  if (!experience) {
    throw new Error("Experience not found");
  }
};

const createJob = async (recruiterId, jobData) => {
  const company = await getRecruiterCompany(recruiterId);

  await validateExperience(jobData.experienceId);

  const data = {
    ...jobData,
    companyId: company.id,
  };

  return await prisma.job.create({
    data,
    include: {
      company: true,
      experience: true,
    },
  });
};

const getAllJobs = async () => {
  return await prisma.job.findMany({
    where: {
      isActive: true,
    },
    include: {
      company: true,
      experience: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getJobById = async (jobId) => {
  return await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      company: true,
      experience: true,
    },
  });
};

const getMyJobs = async (recruiterId) => {
  const company = await getRecruiterCompany(recruiterId);

  return await prisma.job.findMany({
    where: {
      companyId: company.id,
    },
    include: {
      company: true,
      experience: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateJob = async (recruiterId, jobId, jobData) => {
  const company = await getRecruiterCompany(recruiterId);

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: company.id,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  await validateExperience(jobData.experienceId);

  return await prisma.job.update({
    where: {
      id: jobId,
    },
    data: jobData,
    include: {
      company: true,
      experience: true,
    },
  });
};

const deleteJob = async (recruiterId, jobId) => {
  const company = await getRecruiterCompany(recruiterId);

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: company.id,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  return await prisma.job.delete({
    where: {
      id: jobId,
    },
  });
};

// Get all jobs for admin
const getAllJobsForAdmin = async () => {
  return await prisma.job.findMany({
    include: {
      company: true,
      experience: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Update job active/inactive status
const updateJobStatus = async (jobId, isActive) => {
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  return await prisma.job.update({
    where: {
      id: jobId,
    },
    data: {
      isActive,
    },
    include: {
      company: true,
      experience: true,
    },
  });
};

module.exports = {
  getAllJobsForAdmin,
  updateJobStatus,
  getCompanyByRecruiterId,
  getRecruiterCompany,
  validateExperience,
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
};