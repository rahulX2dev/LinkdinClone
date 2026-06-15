import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();



app.use(cors());
app.use(express.json());
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/uploads', express.static('uploads'));





const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.DATABASE_URL;

const start = async () => {
    const connectDB = await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected:", connectDB.connection.host);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

start();
