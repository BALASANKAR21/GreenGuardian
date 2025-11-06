import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./env.js";
import { connectMongo } from "./db.js";
import { PlantModel } from "./plantModel.js";
import { detectLocation, fetchAirQuality, fetchSoilMoisture, fetchWeather, identifyPlantWithPlantNet } from "./external.js";
import os from "os";
// Setup
const app = express();
app.use(helmet());
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
// Hardened CORS: supports "*" (all) or a comma-separated allowlist
const allowed = env.FRONTEND_ORIGIN.trim() === "*"
    ? "*"
    : env.FRONTEND_ORIGIN.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: allowed === "*"
        ? true
        : (origin, callback) => {
            if (!origin)
                return callback(null, true); // same-origin or curl
            if (allowed.includes(origin))
                return callback(null, true);
            return callback(Object.assign(new Error("Not allowed by CORS"), { status: 403 }));
        },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
const limiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);
// File upload (secure tmp dir, size/type limits)
const uploadDir = path.join(os.tmpdir(), "greenguardian-uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
        if (allowedTypes.includes(file.mimetype))
            return cb(null, true);
        return cb(Object.assign(new Error("Invalid file type"), { status: 400 }));
    }
});
// Periodic cleanup of temp upload files older than 12 hours
const MAX_FILE_AGE_MS = 12 * 60 * 60 * 1000;
function cleanupOldUploads() {
    try {
        const now = Date.now();
        for (const name of fs.readdirSync(uploadDir)) {
            const p = path.join(uploadDir, name);
            const stat = fs.statSync(p);
            if (now - stat.mtimeMs > MAX_FILE_AGE_MS) {
                try {
                    fs.unlinkSync(p);
                }
                catch { }
            }
        }
    }
    catch { }
}
// Health
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
});
// Location detection (IPinfo)
app.get("/api/location/detect", async (req, res, next) => {
    try {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || undefined;
        const data = await detectLocation(ip);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
// Environment aggregate
app.get("/api/environment", async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon))
            return res.status(400).json({ error: "lat and lon are required numbers" });
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180)
            return res.status(400).json({ error: "lat/lon out of range" });
        const [weather, air, soil] = await Promise.all([
            fetchWeather(lat, lon),
            fetchAirQuality(lat, lon),
            fetchSoilMoisture(lat, lon)
        ]);
        res.json({ lat, lon, weather, air, soil });
    }
    catch (e) {
        next(e);
    }
});
// Plant identification (Pl@ntNet)
app.post("/api/identify", upload.single("image"), async (req, res, next) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: "image file is required (multipart/form-data, field: image)" });
    try {
        // ensure file exists and has content
        const st = fs.statSync(file.path);
        if (!st.isFile() || st.size === 0) {
            return res.status(400).json({ error: "invalid or empty image file" });
        }
        const result = await identifyPlantWithPlantNet(file.path);
        res.json(result);
    }
    catch (e) {
        next(e);
    }
    finally {
        // cleanup
        try {
            fs.unlinkSync(file.path);
        }
        catch { }
    }
});
// Plant catalog search
app.get("/api/plants", async (req, res, next) => {
    try {
        const { query, tags, space } = req.query;
        if (query && query.length > 64)
            return res.status(400).json({ error: "query too long" });
        const allowedSpaces = new Set(["indoor", "balcony", "outdoor"]);
        if (space && !allowedSpaces.has(String(space))) {
            return res.status(400).json({ error: "invalid space value" });
        }
        const q = {};
        if (query && query.trim().length)
            q.$text = { $search: query.trim() };
        if (tags)
            q.tags = { $in: tags.split(",").map(s => s.trim()).filter(Boolean).slice(0, 10) };
        if (space)
            q.spaces = { $in: [space] };
        let plants;
        try {
            plants = await PlantModel.find(q).limit(50).lean();
        }
        catch (err) {
            // Fallback if $text index is missing: safe regex search
            if (q.$text && query) {
                const safe = escapeRegex(query.trim());
                const regex = new RegExp(safe, "i");
                const fallback = { ...q };
                delete fallback.$text;
                plants = await PlantModel.find({
                    ...fallback,
                    $or: [{ name: regex }, { scientificName: regex }, { tags: regex }]
                })
                    .limit(50)
                    .lean();
            }
            else {
                throw err;
            }
        }
        res.json(plants);
    }
    catch (e) {
        next(e);
    }
});
// Recommendations
app.get("/api/recommendations", async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);
        const rawSpace = String(req.query.space || "indoor");
        const allowedSpaces = new Set(["indoor", "balcony", "outdoor"]);
        const space = allowedSpaces.has(rawSpace) ? rawSpace : "indoor";
        const preferences = String(req.query.preferences || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 10);
        if (!Number.isFinite(lat) || !Number.isFinite(lon))
            return res.status(400).json({ error: "lat and lon are required numbers" });
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180)
            return res.status(400).json({ error: "lat/lon out of range" });
        const [weather, air] = await Promise.all([fetchWeather(lat, lon), fetchAirQuality(lat, lon)]);
        const temp = Number(weather.tempC ?? 22);
        const cloud = Number(weather.cloudiness ?? 20);
        const plants = await PlantModel.find({ spaces: { $in: [space] } }).limit(500).lean();
        // Simple scoring logic
        const scored = plants
            .map(p => {
            let score = 0;
            // Temperature fit
            if (temp >= p.minTempC && temp <= p.maxTempC)
                score += 3;
            else if (Math.abs(temp - (temp < p.minTempC ? p.minTempC : p.maxTempC)) <= 3)
                score += 1;
            // Sunlight fit (cloudiness proxy)
            const sunlight = cloud <= 30 ? "full" : cloud <= 70 ? "partial" : "shade";
            if (p.sunlight === sunlight)
                score += 2;
            // Air quality preference
            const aqi = air.aqiUS ?? 50;
            if (aqi > 80 && p.airPurifying)
                score += 2;
            // Preferences tags
            for (const pref of preferences) {
                if (pref === "air_purifying" && p.airPurifying)
                    score += 1;
                if (pref === "pet_friendly" && p.petFriendly)
                    score += 1;
                if (pref && p.tags.includes(pref))
                    score += 1;
            }
            return { plant: p, score };
        })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
        res.json({
            context: { lat, lon, space, tempC: temp, cloudiness: cloud, aqiUS: air.aqiUS ?? null },
            items: scored
        });
    }
    catch (e) {
        next(e);
    }
});
// 404
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
// Error handler
app.use((err, _req, res, _next) => {
    const status = typeof err?.status === "number" && err.status >= 400 ? err.status : 500;
    const message = typeof err?.message === "string" && err.message.length > 0 ? err.message : "Internal Server Error";
    console.error("[error]", message, err?.stack || "");
    res.status(status).json({ error: message });
});
// Bootstrap
async function start() {
    await connectMongo();
    await seedIfEmpty();
    cleanupOldUploads();
    app.listen(env.PORT, () => {
        console.log(`[api] listening on http://localhost:${env.PORT}`);
        console.log(`[api] CORS: ${env.FRONTEND_ORIGIN}`);
    });
}
start().catch(err => {
    console.error("Failed to start server", err);
    process.exit(1);
});
// Global process error handlers
process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
});
// Seed on empty collection
async function seedIfEmpty() {
    const count = await PlantModel.countDocuments();
    if (count > 0)
        return;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Try multiple locations to support dev (src) and prod (dist)
    const candidates = [
        path.join(__dirname, "plants.seed.json"),
        path.join(process.cwd(), "backend", "src", "plants.seed.json"),
        path.join(process.cwd(), "src", "plants.seed.json")
    ];
    const seedPath = candidates.find(p => fs.existsSync(p));
    if (!seedPath) {
        console.warn("[seed] plants.seed.json not found; skipping seeding");
        return;
    }
    const raw = fs.readFileSync(seedPath, "utf-8");
    const docs = JSON.parse(raw);
    await PlantModel.insertMany(docs);
    console.log(`[seed] inserted ${docs.length} plants`);
}
// Utilities
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
