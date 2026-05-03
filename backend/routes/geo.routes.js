import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// GET /api/geo/country — read current country from cookie
router.get('/country', asyncHandler(async (req, res) => {
  const cookieCountry = (req.cookies?.country_code || '').toString().trim().toUpperCase();
  if (cookieCountry) {
    const currency = cookieCountry === 'IN' ? 'INR' : 'USD';
    return res.json(new ApiResponse(200, { country_code: cookieCountry, currency }, 'from cookie'));
  }
  // No cookie yet — return null so frontend uses locale detection
  res.json(new ApiResponse(200, { country_code: null, currency: null }, 'no country selected'));
}));

// POST /api/geo/country — set country from frontend selection, persists as cookie
router.post('/country', asyncHandler(async (req, res) => {
  const provided = (req.body?.country || '').toString().trim().toUpperCase();
  if (!provided) {
    return res.status(400).json(new ApiResponse(400, null, 'country code required'));
  }
  res.cookie('country_code', provided, { httpOnly: false, sameSite: 'lax', maxAge: 365 * 24 * 60 * 60 * 1000 });
  const currency = provided === 'IN' ? 'INR' : 'USD';
  res.json(new ApiResponse(200, { country_code: provided, currency }, 'country saved'));
}));

export default router;
