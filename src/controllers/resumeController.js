const resumeService = require("../services/resumeService");

const uploadResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const resume = await resumeService.uploadResume({
            userId,
            file: req.file,
        });

        return res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            data: resume,
        });

    } catch (error) {
        console.error("Upload resume error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message || "Failed to upload resume",
        });
    }
};

const getMyResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const resume =
            await resumeService.getMyResume(userId);

        return res.status(200).json({
            success: true,
            data: resume,
        });

    } catch (error) {
        console.error("Get resume error:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to fetch resume",
        });
    }
};

const deleteResume = async (req, res) => {
    try {
        const userId = req.user.id;

        await resumeService.deleteResume(userId);

        return res.status(200).json({
            success: true,
            message: "Resume removed successfully",
        });

    } catch (error) {
        console.error("Delete resume error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message || "Failed to remove resume",
        });
    }
};

const downloadResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const resume = await resumeService.getResumeFile(userId);

        return res.download(
            resume.filePath,
            resume.fileName,
            (error) => {
                if (error && !res.headersSent) {
                    console.error("Download resume error:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to download resume",
                    });
                }
            }
        );
    } catch (error) {
        console.error("Download resume error:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Failed to download resume",
        });
    }
};

module.exports = {
    uploadResume,
    getMyResume,
    deleteResume,
    downloadResume
};