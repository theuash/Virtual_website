import path from 'node:path';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';

const { Client, LocalAuth } = pkg;

let whatsappClient;
let initializingPromise;
let latestQr = null;
let currentStatus = 'idle';

const sessionPath = process.env.WHATSAPP_SESSION_PATH
  ? path.resolve(process.cwd(), process.env.WHATSAPP_SESSION_PATH)
  : path.resolve(process.cwd(), '.wwebjs_auth');

const createClient = () => {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: process.env.WHATSAPP_CLIENT_ID || 'virtual-otp',
      dataPath: sessionPath,
    }),
    puppeteer: {
      headless: process.env.WHATSAPP_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--safebrowsing-disable-auto-update',
      ],
      timeout: 120000,
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
  });

  client.on('qr', (qr) => {
    latestQr = qr;
    currentStatus = 'qr';
    console.log('\nWhatsApp login QR received. Scan it with the WhatsApp app.\n');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    currentStatus = 'authenticated';
    console.log('WhatsApp authenticated successfully.');
  });

  client.on('ready', () => {
    latestQr = null;
    currentStatus = 'ready';
    console.log('WhatsApp client is ready for OTP delivery.');
  });

  client.on('auth_failure', (message) => {
    currentStatus = 'auth_failure';
    console.error('WhatsApp authentication failed:', message);
  });

  client.on('disconnected', (reason) => {
    currentStatus = 'disconnected';
    console.warn('WhatsApp client disconnected:', reason);
  });

  return client;
};

export const initializeWhatsAppClient = async () => {
  if (whatsappClient) {
    return whatsappClient;
  }

  if (initializingPromise) {
    return whatsappClient;
  }

  whatsappClient = createClient();
  currentStatus = 'initializing';
  initializingPromise = whatsappClient.initialize()
    .then(() => whatsappClient)
    .catch((error) => {
      console.error('WhatsApp client initialization failed (non-fatal):', error.message);
      whatsappClient = null;
      currentStatus = 'error';
      // Don't rethrow — WhatsApp failure should not crash the server
    })
    .finally(() => {
      initializingPromise = null;
    });

  return whatsappClient;
};

const normalizeWhatsAppNumber = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `${digits}@c.us` : '';
};

const waitForReady = async (timeoutMs = 60000) => {
  const client = await initializeWhatsAppClient();

  if (currentStatus === 'ready') {
    return client;
  }

  if (currentStatus === 'qr') {
    throw new Error('WhatsApp OTP sender is waiting for QR scan. Scan the QR code in the server terminal, then try signup again.');
  }

  if (currentStatus === 'auth_failure' || currentStatus === 'disconnected' || currentStatus === 'error') {
    throw new Error(`WhatsApp OTP sender is unavailable right now (status: ${currentStatus}). Restart the server and reconnect WhatsApp.`);
  }

  const startedAt = Date.now();
  while (currentStatus !== 'ready') {
    if (currentStatus === 'qr') {
      throw new Error('WhatsApp OTP sender is waiting for QR scan. Scan the QR code in the server terminal, then try signup again.');
    }

    if (currentStatus === 'auth_failure' || currentStatus === 'disconnected' || currentStatus === 'error') {
      throw new Error(`WhatsApp OTP sender is unavailable right now (status: ${currentStatus}). Restart the server and reconnect WhatsApp.`);
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('WhatsApp client is not ready. Scan the QR code shown in the server terminal and try again.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return client;
};

const maskPhone = (phone = '') => {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return trimmed;
  return `${'*'.repeat(Math.max(trimmed.length - 4, 0))}${trimmed.slice(-4)}`;
};

export const sendWhatsAppOtp = async (phone, otp, context = 'login') => {
  console.log(`[WhatsApp OTP] Preparing ${context} code for ${phone}. Current status: ${currentStatus}`);
  
  // Test mode - skip actual WhatsApp sending
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_SUPABASE_OTP === 'true') {
    console.log(`[TEST MODE] Would send WhatsApp OTP ${otp} to ${phone} for ${context}`);
    return {
      delivered: true,
      provider: 'whatsapp-web.js-test-mode',
      destination: maskPhone(phone),
      preview: otp, // Return the code for testing
    };
  }

  const client = await waitForReady();
  const chatId = normalizeWhatsAppNumber(phone);

  if (!chatId) {
    throw new Error('A valid WhatsApp number is required for OTP delivery.');
  }

  const numberRegistration = await client.getNumberId(chatId);
  if (!numberRegistration?._serialized) {
    throw new Error('This phone number is not reachable on WhatsApp.');
  }

  const message = [
    'Virtual verification code',
    `${otp}`,
    '',
    `Use this code to finish your ${context} step.`,
    'It expires in 10 minutes.',
  ].join('\n');

  await client.sendMessage(numberRegistration._serialized, message);
  console.log(`[WhatsApp OTP] ${context} code sent to ${phone}.`);

  return {
    delivered: true,
    provider: 'whatsapp-web.js',
    destination: maskPhone(phone),
  };
};

export const getWhatsAppStatus = () => ({
  status: currentStatus,
  hasQr: Boolean(latestQr),
});

export const maskPhoneNumber = maskPhone;
