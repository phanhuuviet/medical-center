import dotenv from 'dotenv';
import express from 'express';

import routes from './routes/index.js';
import { connectDb } from './utils/connectDb.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

//  Middleware
app.use(express.json());

// Routes application
routes(app);

// Connect DB
await connectDb();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
