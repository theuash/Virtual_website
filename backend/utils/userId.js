/**
 * Generate a unique Virtual user ID.
 * Format: V-{CC}{YY}{XXXXX}
 *   V    = Virtual (fixed prefix)
 *   CC   = 2-letter country code (e.g. IN)
 *   YY   = 2-digit year of joining (e.g. 26)
 *   XXXXX = 5 random uppercase letters, globally unique
 *
 * Example: V-IN26NGMNY
 */

import mongoose from 'mongoose';

// We query all collections to ensure the random suffix is globally unique
const COLLECTIONS = ['freelancers', 'clients', 'momentum_supervisors', 'admins'];

const randomLetters = (n) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < n; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const existsInAnyCollection = async (userId) => {
  for (const col of COLLECTIONS) {
    const doc = await mongoose.connection.collection(col).findOne({ userId }, { projection: { _id: 1 } });
    if (doc) return true;
  }
  return false;
};

export const generateUserId = async (countryCode = 'XX', joinDate = new Date()) => {
  const cc   = (countryCode || 'XX').toUpperCase().slice(0, 2).padEnd(2, 'X');
  const yy   = String(joinDate.getFullYear()).slice(-2);

  let userId;
  let attempts = 0;
  do {
    const suffix = randomLetters(5);
    userId = `V-${cc}${yy}${suffix}`;
    attempts++;
    if (attempts > 100) throw new Error('Could not generate a unique user ID after 100 attempts');
  } while (await existsInAnyCollection(userId));

  return userId;
};
