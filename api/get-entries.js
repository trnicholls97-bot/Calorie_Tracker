export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  return res.json({
    hasFirebaseEnv: !!process.env.FIREBASE_SERVICE_ACCOUNT
  });
}
