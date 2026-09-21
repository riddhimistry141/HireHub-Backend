const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/resume", resumeRoutes);

// Root
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "HireHub API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});