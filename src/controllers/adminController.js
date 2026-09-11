const adminService = require("../services/adminService");
const jobService = require("../services/jobService");

// Get all recruiters
const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await adminService.getAllRecruiters();

    return res.status(200).json({
      success: true,
      message: "Recruiters fetched successfully",
      data: recruiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get pending recruiters
const getPendingRecruiters = async (req, res) => {
  try {
    const recruiters = await adminService.getPendingRecruiters();

    return res.status(200).json({
      success: true,
      message: "Pending recruiters fetched successfully",
      data: recruiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve recruiter
const approveRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await adminService.approveRecruiter(id);

    return res.status(200).json({
      success: true,
      message: "Recruiter approved successfully",
      data: recruiter,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "User is not a recruiter"
    ) {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject recruiter
const rejectRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await adminService.rejectRecruiter(id);

    return res.status(200).json({
      success: true,
      message: "Recruiter rejected successfully",
      data: recruiter,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "User is not a recruiter"
    ) {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Suspend recruiter
const suspendRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await adminService.suspendRecruiter(id);

    return res.status(200).json({
      success: true,
      message: "Recruiter suspended successfully",
      data: recruiter,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "User is not a recruiter"
    ) {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobsForAdmin();

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobService.getJobById(id);

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Job not found") {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};


// Activate / Deactivate job
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const job = await jobService.updateJobStatus(id, isActive);

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Job activated successfully"
        : "Job deactivated successfully",
      data: job,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Job not found") {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Get recruiter details
const getRecruiterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await adminService.getRecruiterDetails(id);

    return res.status(200).json({
      success: true,
      message: "Recruiter details fetched successfully",
      data: recruiter,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "User is not a recruiter"
    ) {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  updateJobStatus,
  getAllRecruiters,
  getRecruiterDetails,
  getPendingRecruiters,
  approveRecruiter,
  rejectRecruiter,
  suspendRecruiter,
};