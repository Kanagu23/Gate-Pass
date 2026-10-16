
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../src/models/Users");

async function createAdmin() {
  const { MONGODB_URI, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } =
    process.env;

  if (!MONGODB_URI || !BOOTSTRAP_ADMIN_EMAIL ||
      !BOOTSTRAP_ADMIN_PASSWORD ||
      BOOTSTRAP_ADMIN_PASSWORD.length < 12 ||
      BOOTSTRAP_ADMIN_PASSWORD.length > 72) {
    throw new Error(
      "Set MONGODB_URI, BOOTSTRAP_ADMIN_EMAIL, and a 12–72 character BOOTSTRAP_ADMIN_PASSWORD"
    );
  }

  await mongoose.connect(MONGODB_URI);

  const existingAdmin = await User.findOne({ role: "ADMIN" });

  if (existingAdmin) {
    console.log("An admin already exists. No account was created.");
    return;
  }

  const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);

  await User.create({
    name: "System Administrator",
    email,
    role: "ADMIN",
    passwordHash,
    isActive: true,
  });

  console.log(`Initial admin created: ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
