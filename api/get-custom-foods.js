export const config = {
  runtime: 'nodejs'
};

import { getCustomFoods, verifyToken, extractTokenFromHeader } from '../lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    // Verify Firebase ID token and extract uid
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    let uid;
    try {
      const token = extractTokenFromHeader(authHeader);
      uid = await verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }

    // Read from users/{uid}/custom_foods
    const foods = await getCustomFoods(uid);

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
