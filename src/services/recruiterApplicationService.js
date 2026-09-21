const prisma = require("../config/prisma");
const resumeService = require("./resumeService");

const scheduleInterview = async ({
  applicationId,
  recruiterId,
  scheduledAt,
  duration,
  meetingLink,
  location,
  notes,
}) => {
  // 1. Find recruiter
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

  if (
    !recruiter.role ||
    recruiter.role.roleName !== "RECRUITER"
  ) {
    throw new Error("Only recruiters can schedule interviews");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  // 2. Find application
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      interview: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // 3. Security check
  if (application.job.companyId !== recruiter.company.id) {
    throw new Error(
      "You are not authorized to schedule an interview for this application"
    );
  }

  // 4. Prevent duplicate interview
  if (application.interview) {
    throw new Error("Interview is already scheduled for this application");
  }

  // 5. Validate scheduled date
  const interviewDate = new Date(scheduledAt);

  if (Number.isNaN(interviewDate.getTime())) {
    throw new Error("Invalid interview date");
  }

  if (interviewDate <= new Date()) {
    throw new Error("Interview date must be in the future");
  }

  // 6. Create interview
  const interview = await prisma.interview.create({
    data: {
      scheduledAt: interviewDate,
      duration: duration || null,
      meetingLink: meetingLink || null,
      location: location || null,
      notes: notes || null,
      applicationId,
    },
  });

  // 7. Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "INTERVIEW",
    },
  });

  return interview;
};


const getRecruiterInterviews = async (recruiterId) => {
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

  if (
    !recruiter.role ||
    recruiter.role.roleName !== "RECRUITER"
  ) {
    throw new Error("Only recruiters can view interviews");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  return await prisma.interview.findMany({
    where: {
      application: {
        job: {
          companyId: recruiter.company.id,
        },
      },
    },
    include: {
      application: {
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
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

const updateInterviewStatus = async ({
  interviewId,
  recruiterId,
  status,
}) => {
  const allowedStatuses = [
    "COMPLETED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid interview status");
  }

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

  if (
    !recruiter.role ||
    recruiter.role.roleName !== "RECRUITER"
  ) {
    throw new Error("Only recruiters can update interviews");
  }

  if (!recruiter.company) {
    throw new Error("Recruiter company not found");
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: {
          job: true,
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  if (
    interview.application.job.companyId !==
    recruiter.company.id
  ) {
    throw new Error(
      "You are not authorized to update this interview"
    );
  }

  if (interview.status === "COMPLETED") {
    throw new Error("Interview is already completed");
  }

  if (interview.status === "CANCELLED") {
    throw new Error("Interview is already cancelled");
  }

  const updatedInterview = await prisma.interview.update({
    where: {
      id: interviewId,
    },
    data: {
      status,
    },
  });

  return updatedInterview;
};

const getRecruiterApplicationResume = async ({
    applicationId,
    recruiterId,
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

    if (
        !recruiter.role ||
        recruiter.role.roleName !== "RECRUITER"
    ) {
        throw new Error(
            "Only recruiters can download applicant resumes"
        );
    }

    if (!recruiter.company) {
        throw new Error("Recruiter company not found");
    }

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            job: true,
        },
    });

    if (!application) {
        throw new Error("Application not found");
    }

    if (
        application.job.companyId !== recruiter.company.id
    ) {
        throw new Error(
            "You are not authorized to download this applicant resume"
        );
    }

    return await resumeService.getApplicationResumeFile(
        application.resumeUrl
    );
};


module.exports ={
    scheduleInterview,
    getRecruiterInterviews,
    updateInterviewStatus,
    getRecruiterApplicationResume

}