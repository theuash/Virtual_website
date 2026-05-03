import { User } from '../models/users/User.js';
import { Client } from '../models/users/Client.js';
import { Freelancer } from '../models/users/Freelancer.js';
import { MomentumSupervisor } from '../models/users/MomentumSupervisor.js';

const MODELS = [Client, Freelancer, MomentumSupervisor, User];

/**
 * Find a user by email across all collections.
 * Returns the document and the model it was found in.
 */
export const findUserByEmail = async (email) => {
  for (const Model of MODELS) {
    const doc = await Model.findOne({ email: email.toLowerCase().trim() });
    if (doc) return doc;
  }
  return null;
};

/**
 * Find a user by _id across all collections.
 */
export const findUserById = async (id) => {
  for (const Model of MODELS) {
    const doc = await Model.findById(id).select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt -loginOtpPending');
    if (doc) return doc;
  }
  return null;
};

/**
 * Find a user by V-ID (userId field) across all collections.
 */
export const findUserByVId = async (vId) => {
  for (const Model of MODELS) {
    const doc = await Model.findOne({ userId: vId.trim() }).select('-passwordHash -otpCodeHash -otpExpiresAt -otpSentAt -loginOtpPending');
    if (doc) return doc;
  }
  return null;
};

/**
 * Get the correct model for a given role string.
 */
export const modelForRole = (role) => {
  switch (role) {
    case 'client':               return Client;
    case 'freelancer':           return Freelancer;
    case 'momentum_supervisor':  return MomentumSupervisor;
    default:                     return User; // admin
  }
};
