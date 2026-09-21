const applicationService = require("../services/applicationService");

const createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const application = await applicationService.createApplication({
      userId,
      jobId,
      coverLetter,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "User not found" ||
      error.message === "Job not found"
    ) {
      statusCode = 404;
    }

    if (
      error.message === "Only job seekers can apply for jobs" ||
      error.message === "This job is no longer active" ||
      error.message === "Application deadline has passed" ||
      error.message === "You have already applied for this job"
    ) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await applicationService.getMyApplications(userId);

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await applicationService.getApplicationById({
      applicationId: id,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Application not found") {
      statusCode = 404;
    }

    if (error.message === "You are not authorized to view this application") {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await applicationService.withdrawApplication({
      applicationId: id,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      data: application,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Application not found") {
      statusCode = 404;
    }

    if (
      error.message === "You are not authorized to withdraw this application"
    ) {
      statusCode = 403;
    }

    if (
      error.message === "Application is already withdrawn" ||
      error.message === "This application can no longer be withdrawn"
    ) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

//recruiter

const getRecruiterApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const applications =
      await applicationService.getRecruiterApplications(recruiterId);

    return res.status(200).json({
      success: true,
      message: "Recruiter applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    let statusCode = 500;

    if (error.message === "Recruiter not found") {
      statusCode = 404;
    }

    if (
      error.message === "Only recruiters can view applications" ||
      error.message === "Recruiter company not found"
    ) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecruiterApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;

    const application = await applicationService.getRecruiterApplicationById({
      applicationId: id,
      recruiterId,
    });

    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "Application not found"
    ) {
      statusCode = 404;
    }

    if (
      error.message === "Only recruiters can view applications" ||
      error.message === "Recruiter company not found"
    ) {
      statusCode = 400;
    }

    if (error.message === "You are not authorized to view this application") {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRecruiterApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Application status is required",
      });
    }

    const application =
      await applicationService.updateRecruiterApplicationStatus({
        applicationId: id,
        recruiterId,
        status,
      });

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    let statusCode = 500;

    if (
      error.message === "Recruiter not found" ||
      error.message === "Application not found"
    ) {
      statusCode = 404;
    }

    if (
      error.message === "Only recruiters can update applications" ||
      error.message === "Recruiter company not found" ||
      error.message === "Invalid application status" ||
      error.message === "Withdrawn applications cannot be updated"
    ) {
      statusCode = 400;
    }

    if (error.message === "You are not authorized to update this application") {
      statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
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
