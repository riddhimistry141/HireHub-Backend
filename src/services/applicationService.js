const prisma = require("../config/prisma");

const createApplication = async ({ userId, jobId, coverLetter }) => {
  // Check user
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const resume = await prisma.resume.findUnique({
    where: { userId },
  });

  if (!resume) {
    throw new Error("Please upload your resume before applying");
  }

  // Only USER can apply
  if (!user.role || user.role.roleName !== "USER") {
    throw new Error("Only job seekers can apply for jobs");
  }

  // Check job
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Job must be active
  if (job.status !== "ACTIVE") {
    throw new Error("This job is no longer active");
  }

  // Check deadline
  if (job.applicationDeadline && new Date() > job.applicationDeadline) {
    throw new Error("Application deadline has passed");
  }

  // Check available slots

  const hiredCount = await prisma.application.count({
    where: {
      jobId: job.id,
      status: "HIRED",
    },
  });

  if (hiredCount >= job.totalSlots) {
    throw new Error("All job slots are filled");
  }

  // Check duplicate application
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId: userId,
        jobId: jobId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("You have already applied for this job");
  }

  // Create application
  const application = await prisma.application.create({
    data: {
      userId: userId,
      jobId: jobId,
      coverLetter: coverLetter || null,
      resumeUrl: resume.fileUrl,
      status: "APPLIED",
    },
    include: {
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
    },
  });

  return application;
};

const getMyApplications = async (userId) => {
  const applications = await prisma.application.findMany({
    where: {
      userId: userId,
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

  return applications;
};

const getApplicationById = async ({ applicationId, userId }) => {
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
      interview: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // User can only see their own application
  if (application.userId !== userId) {
    throw new Error("You are not authorized to view this application");
  }

  return application;
};

const withdrawApplication = async ({ applicationId, userId }) => {
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Only applicant can withdraw
  if (application.userId !== userId) {
    throw new Error("You are not authorized to withdraw this application");
  }

  // Already withdrawn
  if (application.status === "WITHDRAWN") {
    throw new Error("Application is already withdrawn");
  }

  // Cannot withdraw after interview/hiring/rejection
  if (
    application.status === "INTERVIEW" ||
    application.status === "HIRED" ||
    application.status === "REJECTED"
  ) {
    throw new Error("This application can no longer be withdrawn");
  }

  const updatedApplication = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: "WITHDRAWN",
    },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
  });

  return updatedApplication;
};

//recruiter
const getRecruiterApplications = async (recruiterId) => {
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    include: {
      role: true,
      company: true,
    },
  });

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  if (!recruiter.role || recruiter.role.roleName !== "RECRUITER") {
    throw new Error("Only recruiters can view applications");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  return await prisma.application.findMany({
    where: {
      job: {
        companyId: recruiter.company.id,
      },
    },
    include: {
      user: {
        include: {
          auth: {
            select: {
              email: true,
            },
          },
        },
      },
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
      interview: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getRecruiterApplicationById = async ({ applicationId, recruiterId }) => {
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    include: {
      role: true,
      company: true,
    },
  });

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  if (!recruiter.role || recruiter.role.roleName !== "RECRUITER") {
    throw new Error("Only recruiters can view applications");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      user: {
        include: {
          auth: {
            select: {
              email: true,
            },
          },
        },
      },
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
      interview: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.job.companyId !== recruiter.company.id) {
    throw new Error("You are not authorized to view this application");
  }

  return application;
};

const updateRecruiterApplicationStatus = async ({
  applicationId,
  recruiterId,
  status,
}) => {
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId },
    include: {
      role: true,
      company: true,
    },
  });

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  if (!recruiter.role || recruiter.role.roleName !== "RECRUITER") {
    throw new Error("Only recruiters can update applications");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      job: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.job.companyId !== recruiter.company.id) {
    throw new Error("You are not authorized to update this application");
  }

  const allowedStatuses = [
    "APPLIED",
    "REVIEWING",
    "SHORTLISTED",
    "INTERVIEW",
    "REJECTED",
    "HIRED",
    "WITHDRAWN",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid application status");
  }

  if (application.status === "WITHDRAWN") {
    throw new Error("Withdrawn applications cannot be updated");
  }

  if (status === "HIRED" && application.status !== "HIRED") {
    const hiredCount = await prisma.application.count({
      where: {
        jobId: application.jobId,
        status: "HIRED",
      },
    });

    if (hiredCount >= application.job.totalSlots) {
      throw new Error("All job slots have already been filled");
    }
  }

  return await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status,
    },
    include: {
      user: {
        include: {
          auth: {
            select: {
              email: true,
            },
          },
        },
      },
      job: {
        include: {
          company: true,
          experience: true,
        },
      },
      interview: true,
    },
  });
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  getRecruiterApplications,
  getRecruiterApplicationById,
  updateRecruiterApplicationStatus,
};
