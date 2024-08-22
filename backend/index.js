const express = require('express');
const mongoose = require('mongoose');
const auth = require('./routes/auth');  // Import the auth routes
const User = require('./models/User');  // Import the User model
const Ordinooki = require('./models/Ordinooki');  // Import the Ordinooki model
const authMiddleware = require('./middleware/auth'); // Import the authentication middleware

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://danielsnowi:banana222@cluster0.crzel.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Define routes
app.use('/api/auth', auth);

// Deploy Ordinooki endpoint
app.post('/api/deploy-nooki', authMiddleware, async (req, res) => {
    const { inscriptionId } = req.body;
    const userId = req.user.id; // authMiddleware should attach the user object to req

    try {
        // Validate Ordinooki ownership
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the Ordinooki is part of the user's wallet
        const userHasOrdinooki = await Ordinooki.findOne({ userId: user._id, inscriptionId });
        if (!userHasOrdinooki) {
            return res.status(403).json({ message: 'You do not own this Ordinooki' });
        }

        // Save the deployment details in the user's profile
        user.deployedOrdinooki = {
            inscriptionId,
            // Add additional stats or fields from ordinookiData if needed
        };
        await user.save();

        // Respond with success
        res.status(200).json({ message: 'Ordinooki deployed successfully' });

    } catch (error) {
        console.error('Error deploying Ordinooki:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
