import mongoose from 'mongoose';

const SessionKeySchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  encKeyBase64: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true });

export const SessionKey = mongoose.models.SessionKey || mongoose.model('SessionKey', SessionKeySchema);

export async function setSessionKey(token: string, encKeyBase64: string, ttlSeconds: number) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await SessionKey.findOneAndUpdate({ token }, { encKeyBase64, expiresAt }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
}

export async function getSessionKey(token: string): Promise<string | null> {
  if (!token) return null;
  const rec = await SessionKey.findOne({ token }).exec();
  if (!rec) return null;
  if (rec.expiresAt < new Date()) {
    await SessionKey.deleteOne({ token }).exec();
    return null;
  }
  return rec.encKeyBase64;
}

export async function deleteSessionKey(token: string) {
  await SessionKey.deleteOne({ token }).exec();
}
