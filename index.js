import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { DB_Connect } from './config/dbConect.js';
import chatSocket from './sockets/chatSocket.js';
import { route } from './routes/index.js';

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;
const allowOriginList = ['http://localhost:3000', 'http://localhost:3001'];
const io = new Server(server, {
  cors: {
    origin: allowOriginList, // Allow all origins
    methods: ['GET', 'POST'],
  }
});
app.use(cookieParser())
app.use(cors({
  origin: allowOriginList,
  credentials: true
}));
app.use(express.json());
DB_Connect();

server.listen(PORT, () => {
  console.log("server run", PORT);
});

// app.get('/', async (req, res) => {
//     res.json({
//         message: "Hello, world!"
//     });
// });

chatSocket(io);
app.use('/api/', route)

