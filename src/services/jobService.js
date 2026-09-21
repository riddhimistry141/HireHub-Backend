const prisma = require("../config/prisma");
const { PrismaClient, JobStatus } = require("@prisma/client");

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
      status: "ACTIVE",
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
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      company: true,
      experience: true,
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const applied = job.applications.length;

  const hired = job.applications.filter(
    (application) => application.status === "HIRED"
  ).length;

  const left = Math.max(job.totalSlots - hired, 0);

  return {
    ...job,
    applied,
    hired,
    left,
  };
};
const getRecruiterJobById = async (recruiterId, jobId) => {
  const company = await getRecruiterCompany(recruiterId);

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: company.id,
    },
    include: {
      company: true,
      experience: true,
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const applied = job.applications.length;

  const hired = job.applications.filter(
    (application) => application.status === "HIRED"
  ).length;

  const left = job.totalSlots - hired;

  return {
    ...job,
    applied,
    hired,
    left,
  };
};

const getMyJobs = async (recruiterId) => {
  const company = await getRecruiterCompany(recruiterId);

  const jobs = await prisma.job.findMany({
    where: {
      companyId: company.id,
    },
    include: {
      company: true,
      experience: true,
      applications: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return jobs.map((job) => {
    const applied = job.applications.length;

    const hired = job.applications.filter(
      (application) => application.status === "HIRED"
    ).length;

    const left = job.totalSlots - hired;

    return {
      ...job,
      applied,
      hired,
      left,
    };
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

  if (jobData.applicationDeadline) {
    const deadline = new Date(jobData.applicationDeadline);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (deadline <= today) {
      throw new Error("Application deadline must be a future date");
    }
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
const updateJobStatus = async (jobId, status) => {
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
      status: status,
    },
    include: {
      company: true,
      experience: true,
    },
  });
};

const saveJob = async (userId, jobId) => {
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const existingSavedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (existingSavedJob) {
    await prisma.savedJob.delete({
      where: {
        id: existingSavedJob.id,
      },
    });

    return {
      saved: false,
      message: "Job removed from saved jobs",
    };
  }

  await prisma.savedJob.create({
    data: {
      userId,
      jobId,
    },
  });

  return {
    saved: true,
    message: "Job saved successfully",
  };
};

const checkSavedJob = async (userId, jobId) => {
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  return {
    saved: !!savedJob,
  };
};

const getSavedJobs = async (userId) => {
  const savedJobs = await prisma.savedJob.findMany({
    where: {
      userId,
    },
    include: {
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return savedJobs;
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
  getRecruiterJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  saveJob,
  checkSavedJob,
  getSavedJobs,
};