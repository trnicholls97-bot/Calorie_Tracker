export const config = {
  runtime: 'nodejs'
};

import { saveCustomFood, verifyToken, extractTokenFromHeader } from '../lib/firebase.js';

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

    const { name, calories, protein_g, carbs_g, fat_g, tags } = req.body;

    // Validate required fields
    if (!name || calories === undefined || calories === null) {
      return res.status(400).json({ error: 'Missing required fields: name, calories' });
    }

    const food = {
      name,
      calories: Number(calories),
      protein_g: Number(protein_g || 0),
      carbs_g: Number(carbs_g || 0),
      fat_g: Number(fat_g || 0),
      tags: tags || '',
      createdAt: new Date().toISOString()
    };

    // Write to users/{uid}/custom_foods
    const savedFood = await saveCustomFood(food, uid);

    res.status(200).json(savedFood);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
