import 'dotenv/config.js';
import http from 'http';
import app from './app.js'; // This is your Express instance
import { connectDB } from './config/db.js';
import { initSocketIO } from './sockets/index.js';
import cors from 'cors';

// DO NOT use: const app = express(); <--- This was the error

// Apply CORS to the imported app
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://virtual-core.onrender.com',
  credentials: true
}));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocketIO(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io ready on port ${PORT}`);
    console.log(`OTP Service: Supabase Email OTP enabled`);
  });
});