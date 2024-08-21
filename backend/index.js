const express = require('express');
const mongoose = require('mongoose');
const auth = require('./routes/auth');  // Import the auth routes

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://danielsnowi:banana222@cluster0.crzel.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Define routes
app.use('/api/auth', auth);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
