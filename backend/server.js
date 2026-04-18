import 'dotenv/config.js';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
// import { initializeWhatsAppClient } from './services/whatsapp.service.js'; // DISABLED - Using Supabase OTP instead
import { initSocketIO } from './sockets/index.js';

const PORT = process.env.PORT || 5000;

// Attach Socket.io to the same HTTP server as Express
const server = http.createServer(app);
initSocketIO(server);

connectDB().then(() => {
  // WhatsApp initialization disabled - using Supabase OTP instead
  // initializeWhatsAppClient().catch((error) => {
  //   console.error('WhatsApp client failed to initialize:', error.message);
  // });

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io ready on ws://localhost:${PORT}`);
    console.log(`OTP Service: Supabase Email OTP enabled`);
  });
});
