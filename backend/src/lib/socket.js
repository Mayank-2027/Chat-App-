import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

export const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5001", "http://127.0.0.1:5173"];

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  },
});


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
