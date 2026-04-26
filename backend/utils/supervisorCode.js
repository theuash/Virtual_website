import { MomentumSupervisor } from '../models/MomentumSupervisor.js';

/**
 * Generate a unique supervisor code.
 * Format: V{YY}{CC}MS-{EEE}{NN}
 *   V    = Virtual (permanent prefix)
 *   YY   = 2-digit year of joining (e.g. 26)
 *   CC   = 2-letter country code (e.g. IN) — defaults to XX if unknown
 *   MS   = Momentum Supervisor shortform (permanent)
 *   EEE  = First 3 letters of email local part (uppercase)
 *   NN   = 2-digit sequence if same EEE prefix already exists (01, 02 …)
 *
 * Example: V26INMS-LUM01
 */
export const generateSupervisorCode = async (email, countryCode = 'XX', joinDate = new Date()) => {
  const year = String(joinDate.getFullYear()).slice(-2); // "26"
  const cc   = (countryCode || 'XX').toUpperCase().slice(0, 2).padEnd(2, 'X');
  const eee  = email.split('@')[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

  const prefix = `V${year}${cc}MS-${eee}`;

  // Find how many supervisors already have this prefix
  const existing = await MomentumSupervisor.find({
    supervisorCode: { $regex: `^${prefix}` },
  }).select('supervisorCode').lean();

  const seq = String(existing.length + 1).padStart(2, '0');
  return `${prefix}${seq}`;
};
