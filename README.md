# Chat App

A full-stack real-time chat application built with the MERN stack and Socket.IO.
The project demonstrates secure JWT authentication, real-time messaging, and modern React state management.

---

## Overview

This application allows users to register, log in, and exchange messages in real time. It combines REST APIs for authentication and data fetching with WebSockets for instant message delivery.

The system follows a hybrid architecture:

* REST APIs → authentication, user data, message history
* Socket.IO → real-time communication
* MongoDB → persistent storage

---

## Features

* User registration and login with JWT authentication
* Secure password hashing using bcrypt
* Protected backend routes
* Real-time one-to-one messaging using Socket.IO
* Online/offline user tracking
* Message persistence in MongoDB
* Responsive frontend built with React
* Global state management (Zustand or Context depending on your implementation)

---

## Tech Stack

**Frontend**

* React
* JavaScript (ES6+)
* Axios
* Zustand / Context API
* Socket.IO Client

**Backend**

* Node.js
* Express.js
* MongoDB with Mongoose
* JWT (JSON Web Token)
* bcrypt
* Socket.IO

---

## Project Structure

```
Chat-App/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│
└── README.md
```

---

## Authentication Flow

### Registration

1. User submits name, email, and password.
2. Backend validates input.
3. Password is hashed using bcrypt.
4. User is stored in MongoDB.
5. JWT token is generated and returned.
6. Frontend stores token for future requests.

### Login

1. User submits email and password.
2. Backend finds user and compares password.
3. New JWT token is generated.
4. Frontend stores token and updates auth state.

### Protected Routes

* Frontend sends `Authorization: Bearer <token>`
* Backend middleware verifies JWT.
* If valid → request proceeds.
* If invalid → 401 Unauthorized.

---

## Real-Time Messaging Flow

1. User connects to Socket.IO server.
2. Server maps `userId → socketId`.
3. Sender emits `sendMessage`.
4. Server stores message in MongoDB.
5. Server emits message to receiver socket.
6. Receiver UI updates instantly.

---

## Environment Variables

Create a `.env` file inside the backend folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

---

## Installation and Setup

### 1. Clone the repository

```
git clone https://github.com/Mayank-2027/Chat-App-.git
cd Chat-App-
```

### 2. Setup Backend

```
cd backend
npm install
npm run dev
```

### 3. Setup Frontend

Open a new terminal:

```
cd frontend
npm install
npm run dev
```

---

## API Endpoints (Core)

### Auth

* `POST /api/auth/register` — Register user
* `POST /api/auth/login` — Login user
* `GET /api/auth/me` — Get current user

### Messages

* `GET /api/messages/:userId` — Fetch chat history
* `POST /api/messages` — Send message (if REST used)

---

## Socket Events

**Client → Server**

* `sendMessage`
* `typing` (if implemented)

**Server → Client**

* `newMessage`
* `onlineUsers`

---

## Security Notes

* Passwords are hashed using bcrypt.
* JWT is used for stateless authentication.
* Protected routes use auth middleware.
* Sensitive keys are stored in environment variables.

---

## Future Improvements

* Socket authentication using JWT
* Message pagination (infinite scroll)
* Read receipts and typing indicators
* Group chat support
* Refresh token system
* Rate limiting and brute-force protection
* Redis for scalable socket handling
* Google OAuth / Firebase login integration

---

## Author

**Mayank Chandravanshi**
B.Tech Information Technology

---

## License

This project is for learning and educational purposes.
