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
const auth = admin.auth();

// ══════════════════════════════════════════════
//  TOKEN VERIFICATION & AUTH
// ══════════════════════════════════════════════

/**
 * Verify Firebase ID token and extract uid
 * Throws error if token is invalid or missing
 */
export async function verifyToken(token) {
  if (!token) {
    throw new Error('Missing authorization token');
  }

  // Remove 'Bearer ' prefix if present
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    const decodedToken = await auth.verifyIdToken(cleanToken);
    return decodedToken.uid;
  } catch (err) {
    throw new Error(`Invalid token: ${err.message}`);
  }
}

/**
 * Extract Firebase token from Authorization header
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }
  return parts[1];
}

// ══════════════════════════════════════════════
//  ENTRIES (Food Log) - UID-SCOPED
// ══════════════════════════════════════════════

export async function saveEntry(entry, uid) {
  if (!uid) throw new Error('Missing uid');
  return await db.collection('users').doc(uid).collection('entries').add(entry);
}

export async function getEntries(uid) {
  if (!uid) throw new Error('Missing uid');
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('entries')
    .orderBy('timestamp', 'desc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ══════════════════════════════════════════════
//  CUSTOM FOODS - UID-SCOPED
// ══════════════════════════════════════════════

export async function saveCustomFood(food, uid) {
  if (!uid) throw new Error('Missing uid');
  const ref = await db.collection('users').doc(uid).collection('custom_foods').add(food);
  return { id: ref.id, ...food };
}

export async function getCustomFoods(uid) {
  if (!uid) throw new Error('Missing uid');
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('custom_foods')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteCustomFood(foodId, uid) {
  if (!uid) throw new Error('Missing uid');
  return await db.collection('users').doc(uid).collection('custom_foods').doc(foodId).delete();
}
