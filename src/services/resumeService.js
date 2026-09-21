const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

const uploadResume = async ({ userId, file }) => {
    if (!file) {
        throw new Error("Resume file is required");
    }

    const existingResume = await prisma.resume.findUnique({
        where: { userId },
    });

    if (existingResume) {
        return prisma.resume.update({
            where: { userId },
            data: {
                fileName: file.originalname,
                fileUrl: path.join(
                    "uploads",
                    "resumes",
                    file.filename
                ),
                fileType: file.mimetype,
                fileSize: file.size,
            },
        });
    }

    return prisma.resume.create({
        data: {
            fileName: file.originalname,
            fileUrl: path.join(
                "uploads",
                "resumes",
                file.filename
            ),
            fileType: file.mimetype,
            fileSize: file.size,
            userId,
        },
    });
};

const getMyResume = async (userId) => {
    return await prisma.resume.findUnique({
        where: {
            userId: userId,
        },
    });
};

const deleteResume = async (userId) => {
    const resume = await prisma.resume.findUnique({
        where: {
            userId: userId,
        },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    const filePath = path.join(
        process.cwd(),
        resume.fileUrl
    );

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    return await prisma.resume.delete({
        where: {
            userId: userId,
        },
    });
};

const getResumeFile = async (userId) => {
    const resume = await prisma.resume.findUnique({
        where: { userId },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    const filePath = path.join(process.cwd(), resume.fileUrl);

    if (!fs.existsSync(filePath)) {
        throw new Error("Resume file not found");
    }

    return {
        filePath,
        fileName: resume.fileName,
    };
};

const getApplicationResumeFile = async (resumeUrl, fileName) => {
    if (!resumeUrl) {
        throw new Error("Resume not available for this application");
    }

    const filePath = path.resolve(
        process.cwd(),
        resumeUrl
    );

    if (!fs.existsSync(filePath)) {
        throw new Error("Resume file not found");
    }

    return {
        filePath,
        fileName: fileName || path.basename(filePath),
    };
};

module.exports = {
    uploadResume,
    getMyResume,
    deleteResume,
    getResumeFile,
    getApplicationResumeFile
};