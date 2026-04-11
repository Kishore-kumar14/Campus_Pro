require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
// Inside Docker, the 'host' name is 'mongodb' (matching the service name in docker-compose)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://mongodb:27017/campuspro';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🚀 Riviera Vault: Database Connected'))
  .catch(err => console.error('❌ Database Connection Error:', err));

// Routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("CampusPro Server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
