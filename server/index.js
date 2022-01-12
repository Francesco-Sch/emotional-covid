import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
    origin: '*'
}))

// Import routes
import apiRoutes from "./api/api-routes.js"

// Use Api routes in the App
app.use('/api', apiRoutes)

// Connect to Mongoose and set connection variable
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true});
let db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

const port = process.env.PORT || 3000;

// Send message for default URL
app.get('/', (req, res) => res.send('API is running. Check "/api" path'));

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running Emotional Covid-API on port " + port);
});