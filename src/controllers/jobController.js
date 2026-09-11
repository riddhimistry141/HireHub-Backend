const { JobType } = require("@prisma/client");
const jobService = require("../services/jobService");

const allowedJobTypes = Object.values(JobType);

// CREATE JOB
const createJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const {
      title,
      description,
      location,
      salary,
      jobType,
      skills,
      experienceId,
      responsibilities,
      requirements,
      benefits,
      applicationDeadline,
    } = req.body;

    // Required field validation
    if (!title || !description || !location || !salary || !jobType) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, location, salary and job type are required",
      });
    }

    // Validate job type from Prisma enum
    if (!allowedJobTypes.includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job type",
        allowedJobTypes,
      });
    }

    // Validate skills
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    // Prepare job data
    const jobData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      salary: salary.trim(),
      jobType,
      skills,
      experienceId: experienceId || null,

      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],

      requirements: Array.isArray(requirements) ? requirements : [],

      benefits: Array.isArray(benefits) ? benefits : [],

      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline)
        : null,
    };

    // Check invalid deadline
    if (
      jobData.applicationDeadline &&
      Number.isNaN(jobData.applicationDeadline.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application deadline",
      });
    }

    const job = await jobService.createJob(recruiterId, jobData);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    if (
      error.message === "Company not found. Create your company profile first."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Experience not found") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

// GET ALL ACTIVE JOBS
const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs();

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

// GET JOB BY ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobService.getJobById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

// GET RECRUITER'S JOBS
const getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const jobs = await jobService.getMyJobs(recruiterId);

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get my jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs",
    });
  }
};

// UPDATE JOB
const updateJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const { id } = req.params;

    const {
      title,
      description,
      location,
      salary,
      jobType,
      skills,
      experienceId,
      responsibilities,
      requirements,
      benefits,
      applicationDeadline,
      isActive,
    } = req.body;

    // Validate job type
    if (jobType && !allowedJobTypes.includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job type",
        allowedJobTypes,
      });
    }

    const jobData = {};

    if (title !== undefined) {
      jobData.title = title.trim();
    }

    if (description !== undefined) {
      jobData.description = description.trim();
    }

    if (location !== undefined) {
      jobData.location = location.trim();
    }

    // Single salary field
    if (salary !== undefined) {
      if (typeof salary !== "string") {
        return res.status(400).json({
          success: false,
          message: "Salary must be a string",
        });
      }

      if (!salary.trim()) {
        return res.status(400).json({
          success: false,
          message: "Salary cannot be empty",
        });
      }

      jobData.salary = salary.trim();
    }

    if (jobType !== undefined) {
      jobData.jobType = jobType;
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array",
        });
      }

      jobData.skills = skills;
    }

    if (experienceId !== undefined) {
      jobData.experienceId = experienceId || null;
    }

    if (responsibilities !== undefined) {
      jobData.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : [];
    }

    if (requirements !== undefined) {
      jobData.requirements = Array.isArray(requirements) ? requirements : [];
    }

    if (benefits !== undefined) {
      jobData.benefits = Array.isArray(benefits) ? benefits : [];
    }

    if (applicationDeadline !== undefined) {
      jobData.applicationDeadline = applicationDeadline
        ? new Date(applicationDeadline)
        : null;

      if (
        jobData.applicationDeadline &&
        Number.isNaN(jobData.applicationDeadline.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid application deadline",
        });
      }
    }

    if (isActive !== undefined) {
      jobData.isActive = isActive;
    }

    const job = await jobService.updateJob(recruiterId, id, jobData);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    if (
      error.message === "Company not found. Create your company profile first."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Experience not found") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Job not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

// DELETE JOB
const deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const { id } = req.params;

    await jobService.deleteJob(recruiterId, id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    if (error.message === "Job not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
};
