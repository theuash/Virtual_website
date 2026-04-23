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
    return res.json(new ApiResponse(200, { country_code: null }, 'ipstack not configured'));
  }

  // Get real IP — trust X-Forwarded-For from Render/proxies
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  // Don't call ipstack for localhost/private IPs
  const isLocal = !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.');
  if (isLocal) {
    return res.json(new ApiResponse(200, { country_code: null }, 'local IP'));
  }

  try {
    const response = await fetch(
      `https://api.ipstack.com/${ip}?access_key=${apiKey}&fields=country_code&output=json`
    );
    const data = await response.json();
    res.json(new ApiResponse(200, { country_code: data?.country_code || null }, 'OK'));
  } catch {
    res.json(new ApiResponse(200, { country_code: null }, 'ipstack error'));
  }
}));

export default router;
