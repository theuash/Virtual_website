/**
 * messagingClient.js
 *
 * Helper for the main backend to call the messaging server's
 * internal routes using the shared INTERNAL_SECRET header.
 *
 * Usage:
 *   import { createProjectConversation } from '../utils/messagingClient.js';
 *   const conv = await createProjectConversation(projectId, [clientId, freelancerId]);
 */

import axios from 'axios';

const MESSAGING_URL    = process.env.MESSAGING_URL    || 'http://localhost:4001';
const INTERNAL_SECRET  = process.env.INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  console.warn('[messagingClient] INTERNAL_SECRET is not set — internal calls will fail');
}

const internalClient = axios.create({
  baseURL: MESSAGING_URL,
  timeout: 8000,
  headers: {
    'Content-Type':     'application/json',
    'x-internal-secret': INTERNAL_SECRET,
  },
});

/**
 * Create a conversation on the messaging server.
 *
 * @param {'dm'|'team'|'project'} type
 * @param {string[]} memberIds   — array of user ObjectId strings
 * @param {string}  [projectId] — required when type === 'project'
 * @param {string}  [name]      — optional display name
 * @returns {Promise<object>}   — the created (or existing) Conversation document
 */
export const createConversation = async (type, memberIds, projectId = null, name = '') => {
  const res = await internalClient.post('/internal/conversations', {
    type,
    members: memberIds,
    ...(projectId && { projectId }),
    ...(name && { name }),
  });
  return res.data.data;
};

/**
 * Convenience: create a project conversation when a new project is posted.
 *
 * @param {string}   projectId
 * @param {string[]} memberIds  — e.g. [clientId, assignedFreelancerId]
 */
export const createProjectConversation = (projectId, memberIds) =>
  createConversation('project', memberIds, projectId, `Project ${projectId}`);

/**
 * Convenience: create a DM conversation between two users.
 *
 * @param {string} userIdA
 * @param {string} userIdB
 */
export const createDMConversation = (userIdA, userIdB) =>
  createConversation('dm', [userIdA, userIdB]);

/**
 * Fetch a conversation by ID from the messaging server.
 *
 * @param {string} conversationId
 */
export const getConversation = async (conversationId) => {
  const res = await internalClient.get(`/internal/conversations/${conversationId}`);
  return res.data.data;
};
