
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import cors from 'cors';
import { server , app} from "./lib/socket.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";


import dotenv from 'dotenv'
import {connectDB} from './lib/db.js'
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
    origin : allowedOrigins,
    credentials :true
}));

app.use("/api/auth",authRouter);
app.use("/api/messages",messageRouter);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

connectDB();
server.listen(PORT,()=>{
    console.log(`Server is running on server PORT ${PORT}`)
});
