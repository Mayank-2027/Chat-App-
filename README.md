# Real-Time Chat App with WebRTC 1-to-1 Audio & Video Calling

A full-stack real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and WebRTC (`RTCPeerConnection`).

---

## Overview

This application allows authenticated users to exchange text and image messages in real time, as well as initiate 1-to-1 audio and video calls directly between browsers.

The system architecture cleanly separates responsibilities:
- **REST APIs**: User authentication, profile management, and message history.
- **Socket.io**: Real-time message events, online user presence, and WebRTC signaling.
- **WebRTC (`RTCPeerConnection`)**: Direct peer-to-peer audio/video stream exchange between clients.
- **MongoDB**: Persistent storage for user accounts and chat messages.

---

## Features

- 💬 **Real-time Messaging**: Instant text and image sharing powered by Socket.io.
- 📹 **1-to-1 Video Calling**: Native peer-to-peer video streaming using `RTCPeerConnection`.
- 📞 **1-to-1 Audio Calling**: Dedicated audio-only mode.
- 🔔 **Incoming Call Notifications**: Interactive call alerts with Accept and Reject actions.
- 🎙️ **In-Call Media Controls**: Real-time microphone mute/unmute and camera toggle.
- 🖼️ **Picture-in-Picture Video**: Floating local camera view alongside remote stream.
- 🔒 **User Authentication**: Secure JWT cookie-based authentication with bcrypt password hashing.
- 🎨 **Modern Responsive UI**: Built with React, Tailwind CSS, and DaisyUI theme system.

---

## Tech Stack

**Frontend**:
- React & Vite
- Tailwind CSS & DaisyUI
- Zustand (Global State Management)
- Lucide React (Icons)
- Socket.io Client

**Backend**:
- Node.js & Express.js
- MongoDB with Mongoose
- Socket.io Server
- JWT (Cookie-based auth)

**Media & Signaling**:
- WebRTC (`RTCPeerConnection`)
- Socket.io Signaling (`call-user`, `accept-call`, `reject-call`, `ice-candidate`, `end-call`)
- Google STUN Servers (`stun:stun.l.google.com:19302`)

---

## WebRTC Signaling & Architecture Flow

```
Caller (Client A)                 Socket.io Server                  Receiver (Client B)
       │                                 │                                  │
       │─── 1. getUserMedia() ──────────>│                                  │
       │─── 2. createOffer() ───────────>│                                  │
       │─── 3. call-user ───────────────>│                                  │
       │    { to: B, offer, callType }   │─── 4. incoming-call ────────────>│
       │                                 │    { from: A, offer, callType }  │
       │                                 │                                  │
       │                                 │<── 5. accept-call ───────────────│
       │<── 6. call-accepted ────────────│    { to: A, answer }              │
       │    { answer }                   │                                  │
       │                                 │                                  │
       │<─── 7. ICE Candidates (Bi-directional via 'ice-candidate') ───────>│
       │                                 │                                  │
       │════════════════ 8. Direct Peer-to-Peer Media Stream ═══════════════│
       │                  (Audio / Video via RTCPeerConnection)             │
       │                                 │                                  │
       │─── 9. end-call ────────────────>│─── 10. call-ended ──────────────>│
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Connection URI

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mayank-2027/Chat-App-.git
   cd Chat-App-
   ```

2. **Install Dependencies**:
   ```bash
   npm run build
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory:
   ```env
   MONGODB_URL=your_mongodb_connection_string
   PORT=5001
   JWT_SECRET=your_super_secret_jwt_key
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

4. **Run Development Servers**:
   - Backend:
     ```bash
     cd backend && npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend && npm run dev
     ```

---

## Author

**Mayank Chandravanshi**  
B.Tech Information Technology  
GitHub: [@Mayank-2027](https://github.com/Mayank-2027)

---

## License

This project is open-source for learning and educational purposes.
