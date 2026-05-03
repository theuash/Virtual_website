import express from 'express';
import { runSeed, clearSeed } from '../../controllers/features/seed.controller.js';

const router = express.Router();

router.post('/run', runSeed);
router.delete('/clear', clearSeed);

export default router;
