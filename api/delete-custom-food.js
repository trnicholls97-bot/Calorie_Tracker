export const config = {
  runtime: 'nodejs'
};

import { deleteCustomFood, verifyToken, extractTokenFromHeader } from '../lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

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

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing custom food id' });
    }

    // Delete from users/{uid}/custom_foods
    await deleteCustomFood(id, uid);

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
