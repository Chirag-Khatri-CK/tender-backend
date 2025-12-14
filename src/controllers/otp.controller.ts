import bcrypt from "bcryptjs";
import config from "../config";
import User from "../models/User";
import Otp from "../models/Otp";
import { ensureRoleDoc, generateAuthToken } from "../utils/authToken";
import { AppError } from "../utils/AppError";

/* ======================= Generate Numeric OTP ======================= */
function genOtp(digits = 6) {
  const max = 10 ** digits;
  return Math.floor(Math.random() * max).toString().padStart(digits, "0");
}

/* ======================= Send OTP  ======================= */
async function sendOtp({ to, code, method }: { to: string; code: string; method: "email" | "phone" }) {
  console.log(`Send OTP ${code} to ${to} via ${method}`);
  // TODO: integrate with email / SMS provider
}

/* ======================= REQUEST OTP ======================= */
export async function requestOtpHandler(body: any) {
  try {
    const { identifier, method = "email", purpose = "auth", role } = body;
    if (!identifier) throw new AppError(400, "Identifier required");

    const digits = config.otp?.digits || 6;
    const ttlMinutes = purpose === "auth" ? config.otp?.ttlMinutes || 5 : 10;

    let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }], isDeleted: false });

    // Signup flow: create user if doesn't exist
    if (!user && purpose === "auth") {
      if (!role) throw new AppError(400, "Role required for signup");
      user = await User.create({
        email: method === "email" ? identifier : undefined,
        phone: method === "phone" ? identifier : undefined,
        role,
        isActive: false,
        status: "pending"
      });
    }

    const code = genOtp(digits);
    const otpHash = await bcrypt.hash(code, 10);

    const otpDoc = await Otp.create({
      userId: user?._id,
      identifier,
      otpHash,
      method,
      purpose,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      attempts: 0,
      used: false
    });

    await sendOtp({ to: identifier, code, method });

    return {
      success: true,
      otpId: otpDoc._id,
      code: code // remove in production
    };
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return { success: false, status, message: err.message || "error" };
  }
}

/* ======================= VERIFY OTP ========================= */
export async function verifyOtpHandler(body: any) {
  try {
    const { otpId, identifier, code } = body;
    if (!otpId || !identifier || !code) throw new AppError(400, "Missing required fields");

    const otp = await Otp.findOne({ _id: otpId, identifier, used: false, expiresAt: { $gt: new Date() } });
    if (!otp) throw new AppError(400, "Invalid or expired OTP");

    // limit attempts
    if ((otp.attempts || 0) >= (config.otp?.maxAttempts || 5)) throw new AppError(429, "Too many attempts");

    const isValid = await bcrypt.compare(code, otp.otpHash);
    if (!isValid) {
      otp.attempts++;
      await otp.save();
      throw new AppError(400, "Invalid OTP");
    }

    otp.used = true;
    await otp.save();

    let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    // signup / first-time login
    if (otp.purpose === "auth") {
      const wasInactive = !user.isActive;

      if (!user && otp.userId) {
        user = await User.findById(otp.userId);
      }

      if (!user) throw new AppError(404, "User not found");

      user.isActive = true;
      user.status = "active";
      if (otp.method === "email") user.emailVerified = true;
      if (otp.method === "phone") user.phoneVerified = true;

      await user.save();
      await ensureRoleDoc(user);

      const { accessToken, roleId, userId } = await generateAuthToken(user);

      return {
        success: true,
        data: {
          accessToken,
          user: {
            roleId, userId, fullName: user.name, isNewUser: wasInactive
          }
        }
      };
    }

    // verification only
    if (!user) throw new AppError(404, "User not found");

    if (otp.purpose === "verify_email") user.emailVerified = true;
    if (otp.purpose === "verify_phone") user.phoneVerified = true;
    await user.save();

    return { success: true, data: { message: `${otp.purpose.replace("_", " ")} successful` } };
  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return { success: false, status, message: err.message || "error" };
  }
}
