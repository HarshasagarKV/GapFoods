const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const cors = require('cors');
// Initialize dotenv to read environment variables
console.log("sss")

const app = express();
app.use(cors());
// Middleware
app.use(express.json());
// Routes
app.use('/api/user', userRoutes);
app.get('/',  (req, res) => {console.log("sss");res.send('Hello World');})
// pZiJ8NIBTcWO2ZjZ
// harshasagar1506
// Connect to MongoDB
const uri = "mongodb+srv://harshasagar1506:pZiJ8NIBTcWO2ZjZ@cluster0.gsaat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


async function connectDB() {
    try {
        await mongoose.connect(uri, {
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
}

connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
