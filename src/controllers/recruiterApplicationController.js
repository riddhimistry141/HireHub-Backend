const recruiterApplicationService = require("../services/recruiterApplicationService")
const scheduleInterview = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const applicationId = req.params.id;

    const {
      scheduledAt,
      duration,
      meetingLink,
      location,
      notes,
    } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Interview date and time are required",
      });
    }

    const interview =
      await recruiterApplicationService.scheduleInterview({
        applicationId,
        recruiterId,
        scheduledAt,
        duration,
        meetingLink,
        location,
        notes,
      });

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: interview,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to schedule interview",
    });
  }
};

const getRecruiterInterviews = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const interviews =
      await recruiterApplicationService.getRecruiterInterviews(
        recruiterId
      );

    return res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("Get recruiter interviews error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to fetch recruiter interviews",
    });
  }
};

const updateInterviewStatus = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const interviewId = req.params.id;

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Interview status is required",
      });
    }

    const interview =
      await recruiterApplicationService.updateInterviewStatus({
        interviewId,
        recruiterId,
        status,
      });

    return res.status(200).json({
      success: true,
      message: "Interview status updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error("Update interview status error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update interview status",
    });
  }
};

const downloadRecruiterApplicationResume = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const recruiterId = req.user.id;

        const resume =
            await recruiterApplicationService
                .getRecruiterApplicationResume({
                    applicationId,
                    recruiterId,
                });

        return res.download(
            resume.filePath,
            resume.fileName,
            (error) => {
                if (error && !res.headersSent) {
                    console.error(
                        "Download applicant resume error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to download applicant resume",
                    });
                }
            }
        );
    } catch (error) {
        console.error(
            "Download applicant resume error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    scheduleInterview,
    getRecruiterInterviews,
    updateInterviewStatus,
    downloadRecruiterApplicationResume
}