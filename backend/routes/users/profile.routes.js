import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../../middleware/auth.js';
import { getProfile, updateProfile, removeAvatar } from '../../controllers/users/profile.controller.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[multer] saving file:', file.originalname, file.mimetype);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png').toLowerCase() || '.png';
    const name = `${req.user._id}-${Date.now()}${ext}`;
    console.log('[multer] filename:', name);
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Accept by MIME type OR extension
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExts  = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext  = path.extname(file.originalname || '').toLowerCase();
    const mime = file.mimetype || '';
    if (allowedMimes.includes(mime) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      console.log('[multer] rejected file:', file.originalname, mime);
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = express.Router();
router.use(protect);

router.get('/me',           getProfile);
router.patch('/update',     upload.single('avatar'), updateProfile);
router.delete('/avatar',    removeAvatar);

export default router;
