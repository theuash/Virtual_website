import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { findUserById } from '../../utils/findUser.js';
import { Freelancer } from '../../models/users/Freelancer.js';
import { Client } from '../../models/users/Client.js';
import { MomentumSupervisor } from '../../models/users/MomentumSupervisor.js';
import path from 'path';
import fs from 'fs';

// ── GET /profile/me ──────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'Profile fetched'));
});

// ── PATCH /profile/update ────────────────────────────────────────
// Body: { fullName, phone, dateOfBirth, portfolioUrl, bio, hoursPerWeek, preferredContactTime }
export const updateProfile = asyncHandler(async (req, res) => {
  console.log('[profile] file:', req.file?.filename, '| body keys:', Object.keys(req.body));
  const { fullName, phone, dateOfBirth, portfolioUrl, bio, hoursPerWeek, preferredContactTime, country } = req.body;

  const allowedFields = {};
  if (fullName?.trim())           allowedFields.fullName = fullName.trim();
  if (phone?.trim())              allowedFields.phone = phone.trim();
  if (dateOfBirth)                allowedFields.dateOfBirth = new Date(dateOfBirth);
  if (portfolioUrl !== undefined) allowedFields.portfolioUrl = portfolioUrl.trim();
  if (bio !== undefined)          allowedFields.bio = bio.trim();
  if (hoursPerWeek)               allowedFields.hoursPerWeek = Number(hoursPerWeek);
  if (preferredContactTime)       allowedFields.preferredContactTime = preferredContactTime;
  if (country?.trim())            allowedFields.country = country.trim().toUpperCase();

  // If avatar was uploaded, set the URL
  if (req.file) {
    allowedFields.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  const role = req.user.role;
  let updated;

  if (role === 'freelancer') {
    updated = await Freelancer.findByIdAndUpdate(req.user._id, { $set: allowedFields }, { new: true, runValidators: true })
      .select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt');
  } else if (role === 'client') {
    updated = await Client.findByIdAndUpdate(req.user._id, { $set: allowedFields }, { new: true, runValidators: true })
      .select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt');
  } else if (role === 'momentum_supervisor') {
    updated = await MomentumSupervisor.findByIdAndUpdate(req.user._id, { $set: allowedFields }, { new: true, runValidators: true })
      .select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt');
  } else {
    throw new ApiError(400, 'Unsupported role for profile update');
  }

  if (!updated) throw new ApiError(404, 'User not found');

  res.json(new ApiResponse(200, updated, 'Profile updated'));
});

// ── DELETE /profile/avatar ───────────────────────────────────────
export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  // Delete file from disk if it's a local upload
  if (user.avatar?.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), user.avatar);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  const role = req.user.role;
  if (role === 'freelancer') await Freelancer.findByIdAndUpdate(req.user._id, { $unset: { avatar: 1 } });
  else if (role === 'client') await Client.findByIdAndUpdate(req.user._id, { $unset: { avatar: 1 } });
  else if (role === 'momentum_supervisor') await MomentumSupervisor.findByIdAndUpdate(req.user._id, { $unset: { avatar: 1 } });

  res.json(new ApiResponse(200, null, 'Avatar removed'));
});
