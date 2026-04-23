import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// GET /api/geo/country
// Detects the caller's country via ipstack using their real IP.
// The API key never leaves the server.
router.get('/country', asyncHandler(async (req, res) => {
  const apiKey = process.env.IPSTACK_API_KEY;
  if (!apiKey) {
    console.log('[geo] IPSTACK_API_KEY not set');
    return res.json(new ApiResponse(200, { country_code: null }, 'ipstack not configured'));
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  console.log('[geo] request from IP:', ip);

  // In dev, use ipstack's "check" endpoint which detects the server's own IP
  // (useful for testing — on prod the real client IP comes via X-Forwarded-For)
  const isLocal = !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.');
  const lookupIp = isLocal ? 'check' : ip;

  try {
    const response = await fetch(
      `https://api.ipstack.com/${lookupIp}?access_key=${apiKey}&fields=country_code&output=json`
    );
    const data = await response.json();
    console.log('[geo] ipstack result:', data?.country_code);
    res.json(new ApiResponse(200, { country_code: data?.country_code || null }, 'OK'));
  } catch (err) {
    console.log('[geo] ipstack error:', err.message);
    res.json(new ApiResponse(200, { country_code: null }, 'ipstack error'));
  }
}));

export default router;
