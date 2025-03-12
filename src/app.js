import http from 'http';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import routes from './routes/index.js';
import configurationSocket from './socket/index.js';
import { connectDb } from './utils/connectDb.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes application
routes(app);

// Start server inside an async function
const startServer = async () => {
    try {
        // Connect DB
        await connectDb();
        console.log('✅ Database connected successfully');

        // Connect socket
        configurationSocket(server);

        server.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
    }
};

startServer();
