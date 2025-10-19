import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Initialize Firebase Admin
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET,
});

const bucket = admin.storage().bucket();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: String,
  email: String,
  username: String,
  location: String,
  profilePicture: String,
});

const User = mongoose.model("User", userSchema);

// Verify Firebase ID token middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------- Routes -------- //

// GET user info
app.get("/api/users/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update user info
app.put("/api/users/:userId", verifyToken, async (req, res) => {
  try {
    const updateData = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      updateData,
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload profile picture
app.post(
  "/api/users/:userId/upload",
  verifyToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const fileName = `profilePictures/${req.params.userId}${path.extname(
        req.file.originalname
      )}`;

      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: { contentType: req.file.mimetype },
      });

      stream.end(req.file.buffer);

      stream.on("finish", async () => {
        await file.makePublic();
        const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        const user = await User.findOneAndUpdate(
          { userId: req.params.userId },
          { profilePicture: url },
          { new: true, upsert: true }
        );

        res.json({ url, user });
      });

      stream.on("error", (err) => {
        res.status(500).json({ message: err.message });
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
