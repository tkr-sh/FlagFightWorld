import router from './api/v1/routes/newIndex.js';
import express from "express"; // Express
import cors from "cors"; // CORS

const app = express();
app.use(router);
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', "application/json"],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Headers'],
}));

export default app;