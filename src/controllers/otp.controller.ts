import Otp from "../models/Otp";
import bcrypt from "bcryptjs";
import config from "../config";
import { AppError } from "../utils/AppError";

// generate numeric OTP
function genOtp(digits = 6) {
  const max = 10 ** digits;
  const n = Math.floor(Math.random() * max)
    .toString()
    .padStart(digits, "0");
  return n;
}

export async function requestOtpController(
  userId: string,
  method: string = "email"
) {
  if (!userId) throw new AppError(400, "userId required");

  const digits = config.otp?.digits || 6;
  const ttl = config.otp?.ttlMinutes || 5;

  const code = genOtp(digits);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  const otp = await Otp.create({
    userId,
    codeHash,
    method: method || "email",
    expiresAt,
  });

  return {
    ok: true,
    otpId: otp._id,
    code,
  };
}

export async function verifyOtpController(userId: string, code: string) {
  if (!userId || !code) {
    throw new AppError(400, "userId and code required");
  }

  const rec = await Otp.findOne({ userId, used: false })
    .sort({ expiresAt: -1 })
    .exec();

  if (!rec) throw new AppError(400, "no otp found");
  if (rec.expiresAt < new Date()) throw new AppError(400, "otp expired");

  const ok = await bcrypt.compare(code, rec.codeHash);
  if (!ok) {
    rec.attempts = (rec.attempts || 0) + 1;
    await rec.save();
    throw new AppError(400, "invalid otp");
  }

  rec.used = true;
  await rec.save();

  return { ok: true };
}
