import express from 'express';
import {
  getAllPricing,
  getPricingSummary,
  getDepartmentPricing,
} from '../../controllers/features/pricing.controller.js';

const router = express.Router();

router.get('/',            getAllPricing);
router.get('/summary',     getPricingSummary);
router.get('/:department', getDepartmentPricing);

export default router;
