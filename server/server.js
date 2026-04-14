import 'dotenv/config.js';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initializeWhatsAppClient } from './services/whatsapp.service.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB().then(() => {
  initializeWhatsAppClient().catch((error) => {
    console.error('WhatsApp client failed to initialize:', error.message);
  });

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
