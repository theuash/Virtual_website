import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Pricing } from '../../models/finance/Pricing.js';

// GET /api/pricing — all departments (homepage + full page)
export const getAllPricing = asyncHandler(async (req, res) => {
  const pricing = await Pricing.find().sort({ displayName: 1 });
  res.json(new ApiResponse(200, pricing, 'Pricing retrieved'));
});

// GET /api/pricing/summary — one card per department (homepage strip)
export const getPricingSummary = asyncHandler(async (req, res) => {
  const pricing = await Pricing.find(
    {},
    { department: 1, displayName: 1, startingFrom: 1, startingUnit: 1 }
  ).sort({ displayName: 1 });
  res.json(new ApiResponse(200, pricing, 'Pricing summary retrieved'));
});

// GET /api/pricing/:department — single department detail
export const getDepartmentPricing = asyncHandler(async (req, res) => {
  const pricing = await Pricing.findOne({ department: req.params.department });
  if (!pricing) return res.status(404).json(new ApiResponse(404, null, 'Department not found'));
  res.json(new ApiResponse(200, pricing, 'Department pricing retrieved'));
});
