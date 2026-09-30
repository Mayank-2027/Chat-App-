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
      if (!origin || allowedOrigins.includes(origin) || !process.env.CORS_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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


    socket.on("call-user", ({ userToCall, signalData, callType, from }) => {
        const receiverSocketId = getReceiverSocketId(userToCall);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incoming-call", {
                from,
                signalData,
                callType,
                callerSocketId: socket.id,
            });
        } else {
            socket.emit("call-rejected", { reason: "User is offline" });
        }
    });

    socket.on("accept-call", ({ to, signalData }) => {
        const targetSocketId = getReceiverSocketId(to) || to;
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-accepted", {
                signalData,
                answerSocketId: socket.id,
            });
        }
    });

    socket.on("reject-call", ({ to, reason }) => {
        const targetSocketId = getReceiverSocketId(to) || to;
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-rejected", {
                reason: reason || "Call declined",
            });
        }
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        const targetSocketId = getReceiverSocketId(to) || to;
        if (targetSocketId) {
            io.to(targetSocketId).emit("ice-candidate", { candidate });
        }
    });

    socket.on("end-call", ({ to }) => {
        const targetSocketId = getReceiverSocketId(to) || to;
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-ended");
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export const getReceiverSocketId = (userId) => userSocketMap[userId];
