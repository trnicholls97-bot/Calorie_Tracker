import admin from 'firebase-admin';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT missing at runtime');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (err) {
  throw new Error(`FIREBASE_SERVICE_ACCOUNT invalid JSON: ${err.message}`);
}

if (!serviceAccount.private_key) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is missing private_key');
}

// Normalize PEM newlines
serviceAccount.private_key = serviceAccount.private_key
  .replace(/\\n/g, '\n')
  .trim();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export async function saveEntry(entry) {
  return await db.collection('entries').add(entry);
}

export async function getEntries() {
  const snap = await db.collection('entries').orderBy('timestamp', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
