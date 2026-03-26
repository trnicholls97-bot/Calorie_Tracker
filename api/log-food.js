import { parseFood } from '../lib/anthropic.js';
import { saveEntry } from '../lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { input } = req.body;

    const parsed = await parseFood(input);

    const entry = {
      ...parsed,
      timestamp: new Date().toISOString()
    };

    await saveEntry(entry);

    res.status(200).json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
