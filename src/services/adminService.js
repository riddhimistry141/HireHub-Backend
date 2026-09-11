const prisma = require("../config/prisma");

// Get recruiter by ID
const getRecruiterById = async (userId) => {
  const recruiter = await prisma.user.findUnique({
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
      company: true,
    },
  });

  if (!recruiter) {
    throw new Error("Recruiter not found");
  }

  if (!recruiter.role) {
    throw new Error("Recruiter role not found");
  }

  if (recruiter.role.roleName !== "RECRUITER") {
    throw new Error("User is not a recruiter");
  }

  return recruiter;
};

// Get recruiter details
const getRecruiterDetails = async (userId) => {
  return await getRecruiterById(userId);
};

// Get all recruiters
const getAllRecruiters = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        roleName: "RECRUITER",
      },
    },
    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get pending recruiters
const getPendingRecruiters = async () => {
  return await prisma.user.findMany({
    where: {
      status: "PENDING",
      role: {
        roleName: "RECRUITER",
      },
    },
    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Approve recruiter
const approveRecruiter = async (userId) => {
  const recruiter = await getRecruiterById(userId);

  if (recruiter.status !== "PENDING") {
    throw new Error(
      `Recruiter cannot be approved because current status is ${recruiter.status}`
    );
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "APPROVED",
    },
    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
      company: true,
    },
  });
};

// Reject recruiter
const rejectRecruiter = async (userId) => {
  const recruiter = await getRecruiterById(userId);

  if (recruiter.status !== "PENDING") {
    throw new Error(
      `Recruiter cannot be rejected because current status is ${recruiter.status}`
    );
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "REJECTED",
    },
    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
      company: true,
    },
  });
};

// Suspend recruiter
const suspendRecruiter = async (userId) => {
  const recruiter = await getRecruiterById(userId);

  if (recruiter.status !== "APPROVED") {
    throw new Error(
      `Recruiter cannot be suspended because current status is ${recruiter.status}`
    );
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "SUSPENDED",
    },
    include: {
      role: true,
      auth: {
        select: {
          email: true,
        },
      },
      company: true,
    },
  });
};

module.exports = {
  getAllRecruiters,
  getPendingRecruiters,
  getRecruiterDetails,
  approveRecruiter,
  rejectRecruiter,
  suspendRecruiter,
};