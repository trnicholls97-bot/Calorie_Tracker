export const config = { runtime: 'nodejs' };

import { getEntries } from '../lib/firebase.js';

export default async function handler(req, res) {
  try {
    const entries = await getEntries();
    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
