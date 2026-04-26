// WhatsApp integration removed.
// OTP delivery is handled via email or other configured provider.

export const sendWhatsAppOtp = async (phone, otp, context = 'login') => {
  throw new Error('WhatsApp OTP delivery is not configured. Please use email OTP.');
};

export const getWhatsAppStatus = () => ({ status: 'disabled', message: 'WhatsApp integration removed.' });
export const maskPhoneNumber = (phone = '') => {
  const t = String(phone).trim();
  if (t.length <= 4) return t;
  return `${'*'.repeat(Math.max(t.length - 4, 0))}${t.slice(-4)}`;
};
export const initializeWhatsAppClient = async () => null;
export const generatePairingCode = async () => null;
