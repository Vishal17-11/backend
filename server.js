require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const fileRoutes = require('../routes/fileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/', (req, res) => res.send('Classroom Backend Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));