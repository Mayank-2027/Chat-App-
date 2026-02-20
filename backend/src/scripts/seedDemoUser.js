import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

dotenv.config();

const DEMO_USER = {
  fullName: "Demo Friend",
  email: "demo.friend@chatapp.local",
  password: "demo1234",
  profilePic: "https://api.dicebear.com/9.x/personas/svg?seed=DemoFriend",
};

async function seedDemoUser() {
  await connectDB();

  const existingUser = await User.findOne({ email: DEMO_USER.email });
  if (existingUser) {
    console.log(`Demo user already exists: ${DEMO_USER.email}`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEMO_USER.password, salt);

  const newUser = await User.create({
    fullName: DEMO_USER.fullName,
    email: DEMO_USER.email,
    password: hashedPassword,
    profilePic: DEMO_USER.profilePic,
  });

  console.log("Demo user created successfully.");
  console.log(`Email: ${newUser.email}`);
  console.log(`Password: ${DEMO_USER.password}`);
  process.exit(0);
}

seedDemoUser().catch((error) => {
  console.error("Failed to seed demo user:", error.message);
  process.exit(1);
});
