require('dotenv').config();
const mongoString = process.env.DATABASE_URL
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
