import admin from 'firebase-admin';

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountRaw) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is missing at runtime');
}

const serviceAccount = JSON.parse(serviceAccountRaw);

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
