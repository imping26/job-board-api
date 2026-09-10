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
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
const vercelPreview = /^https:\/\/job-board-frontend-[a-z0-9-]+\.vercel\.app$/;
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser clients (no Origin header), listed origins, and Vercel previews
    if (!origin || allowedOrigins.includes(origin) || vercelPreview.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
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
