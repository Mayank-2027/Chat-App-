import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

export const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";
const ioOptions = {};

if (!isProduction) {
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  ioOptions.cors = {
    origin: allowedOrigins,
    credentials: true,
  };
}

export const io = new Server(server, ioOptions);

const userSocketMap ={};


io.on("connection",(socket)=>{
    console.log("A user connected",socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId]=socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect",()=>{
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
    
});

export const getReceiverSocketId = (userId) => userSocketMap[userId];
