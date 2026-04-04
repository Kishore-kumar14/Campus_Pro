require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/campuspro", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

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
