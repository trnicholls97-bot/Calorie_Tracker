import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
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
