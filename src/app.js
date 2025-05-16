import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { startDailyCheckReqJob } from './cronJobs/checkReqChange.js';
import routes from './routes/index.js';
import { connectDb } from './utils/connectDb.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// CORS
app.use(cors());
app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(`Access-Control-Allow-Headers`, `Content-Type`);
    next();
});

//  Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cron job
startDailyCheckReqJob();

// Routes application
routes(app);

// Connect DB
await connectDb();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
