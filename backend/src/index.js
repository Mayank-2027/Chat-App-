
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import cors from 'cors';
import { server , app} from "./lib/socket.js";
import express from "express";
import path from "path";


import dotenv from 'dotenv'
import {connectDB} from './lib/db.js'
import cookieParser from 'cookie-parser';

dotenv.config();


const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
    origin :"http://localhost:5173",
    credentials :true
}));

app.use("/api/auth",authRouter);
app.use("/api/messages",messageRouter);

if(process.env.NODE_ENV==="Production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
};

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
})
connectDB();
server.listen(PORT,()=>{
    console.log(`Server is running on server PORT ${PORT}`)
});
