import { Request, Response } from 'express';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import config from '../config';

// generate numeric OTP
function genOtp(digits = 6) {
  const max = 10**digits;
  const n = Math.floor(Math.random()*max).toString().padStart(digits,'0');
  return n;
}

export async function requestOtp(req: Request, res: Response) {
  try {
    const { userId, method } = req.body;
    if (!userId) return res.status(400).json({message : 'userId required' });
    const code = genOtp(6);
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + (config.otp.ttlMinutes||5)*60*1000);
    const otp = await Otp.create({ userId, codeHash, method: method||'email', expiresAt });
    // TODO: send via nodemailer or SMS provider. For now return code in response (dev only)
    return res.json({ ok: true, otpId: otp._id, code }); // remove code in production
  } catch (err: any) {
    return res.status(500).json({message : err.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({message : 'userId and code required' });
    const rec = await Otp.findOne({ userId, used: false }).sort({ expiresAt: -1 }).exec();
    if (!rec) return res.status(400).json({message : 'no otp found' });
    if (rec.expiresAt < new Date()) return res.status(400).json({message : 'otp expired' });
    const ok = await bcrypt.compare(code, rec.codeHash);
    if (!ok) {
      rec.attempts = (rec.attempts||0) + 1;
      await rec.save();
      return res.status(400).json({message : 'invalid otp' });
    }
    rec.used = true;
    await rec.save();
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({message : err.message });
  }
}
