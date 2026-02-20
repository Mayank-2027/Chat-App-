
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import cors from "cors";
import { server, app } from "./lib/socket.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;
const HOST = "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const backendSrcDir = path.dirname(__filename);
const projectRoot = path.resolve(backendSrcDir, "../../");
const frontendDistPath = path.join(projectRoot, "frontend", "dist");

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (!isProduction) {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
}

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

if (isProduction) {
  // Serve only Vite build output in production.
  app.use(express.static(frontendDistPath));

  // SPA fallback for non-API routes.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

connectDB();
server.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
