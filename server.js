const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
console.log("DEBUG >> MONGO_URI:", process.env.MONGO_URI);


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const interactionRoutes = require('./routes/interactions');
app.use('/api/interactions', interactionRoutes);

// Serve defaultimage.jpg and other assets from public/
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded images and other static assets
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Serve other static files like frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "Frontend")));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test API Route
app.get("/api", (req, res) => {
  res.send("🚀 API is running...");
});

// Check MongoDB Connection Status
app.get("/api/test-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ success: true, message: "✅ MongoDB Connected", collections });
  } catch (error) {
    res.json({ success: false, message: "❌ MongoDB NOT Connected" });
  }
});

// Import Meal Routes
const mealRoutes = require("./routes/meals");  // Import the routes
app.use("/api/meals", mealRoutes);           // Use the routes

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
