import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import { Server } from 'socket.io';
import { dbConnection } from './db/connection.js';
import { bootStrap } from './src/bootStrap.js';
import { createServer } from 'http';
import { handleUserConnection, io } from './src/modules/notification/notification.controller.js';

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 3000;
dotenv.config({ path: path.resolve("./config/.env") })

// Middleware to parse JSON bodies
app.use(express.json());

// db connection
dbConnection()
// api 
bootStrap(app, express)

// Handle Socket.IO connections
io.on('connection', handleUserConnection)



app.get("/", (req, res) => {
    res.send("Hello from Green World App");
});

httpServer.listen(port, () => console.log(`Server is running on port ${port}!`))