export const config = {
  runtime: 'nodejs'
};

import { getEntries } from '../lib/firebase.js';

export default async function handler(req, res) {
  try {
    const entries = await getEntries();
    res.status(200).json(entries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
