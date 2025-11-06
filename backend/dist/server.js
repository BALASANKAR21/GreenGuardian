import express from "express";
import cors from "cors";
import { itemsRouter } from "./routes/items.js";
import { healthRouter } from "./routes/health.js";
const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: false
}));
app.use(express.json());
// Routes
app.use("/api/health", healthRouter);
app.use("/api/items", itemsRouter);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error("[ERROR]", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    res.status(status).json({ error: err?.message || "Internal Server Error" });
});
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`CORS origin: ${FRONTEND_ORIGIN}`);
});
