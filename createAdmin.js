const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@campusmart.com';
  const password = 'admin123';

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = new User({
    name: 'Admin',
    email,
    password: hashedPassword,
    isAdmin: true  // mark as admin
  });

  await adminUser.save();
  console.log('Admin created');
  process.exit(0);
}

createAdmin();