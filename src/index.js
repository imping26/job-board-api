require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const applicationsRoutes = require("./routes/applicationsRoutes");
const companiesRoutes = require("./routes/companiesRoutes");
const uploadRoutes = require('./routes/uploadRoutes')

const errorHandler = require("./middleware/errorHandler");

const app = express();

// 1. Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json());

// 2. Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use('/api/upload', uploadRoutes)

// 3. Test route
app.get("/", (req, res) => {
  res.json({ message: "Job Board API is running!" });
});

// 4. Error handler — 永远放最底部
app.use(errorHandler);

// 5. Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
