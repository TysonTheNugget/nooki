const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const auth = require('./routes/auth');  // Import the auth routes
const User = require('./models/User');  // Import the User model
const authMiddleware = require('./middleware/auth'); // Import the authentication middleware
const ordinookiData = require('../ordinooki.json');  // Import the Ordinooki data from the JSON file
const DeployedOrdinooki = require('./models/DeployedOrdinooki');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});



// Use CORS to allow requests from your frontend
app.use(cors({ origin: 'http://localhost:3000' }));

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
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

app.get('/api/deployed-nookis', async (req, res) => {
    try {
        const deployedNookis = await DeployedOrdinooki.find();
        res.json(deployedNookis);
    } catch (error) {
        console.error('Error fetching deployed Ordinookis:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

connectDB();

// Define routes
app.use('/api/auth', auth);

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Deploy Ordinooki endpoint
app.post('/api/deploy-nooki', authMiddleware, async (req, res) => {
    const { inscriptionId, position } = req.body;
    const userId = req.user.id;

    console.log('Deploy Request:', { userId, inscriptionId, position });

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const ordinooki = ordinookiData.find(item => item.id === inscriptionId);
        if (!ordinooki) {
            return res.status(404).json({ message: 'Ordinooki not found in data' });
        }

        // Set default position if not provided
        const defaultPosition = { x: 100, y: 100 };
        const finalPosition = position || defaultPosition;

        // Save the deployed Ordinooki to the database
        const deployedOrdinooki = new DeployedOrdinooki({
            userId: user._id,
            inscriptionId,
            position: finalPosition,
            meta: ordinooki.meta
        });

        await deployedOrdinooki.save();

        io.emit('nookiDeployed', { inscriptionId, meta: ordinooki.meta, position: finalPosition });

        res.status(200).json({ message: 'Ordinooki deployed successfully', inscriptionId, meta: ordinooki.meta, position: finalPosition });

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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
