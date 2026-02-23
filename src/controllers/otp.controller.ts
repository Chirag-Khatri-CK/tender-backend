import bcrypt from "bcryptjs";
import config from "../config";
import User, { UserRole } from "../models/core/User";
import Otp from "../models/core/Otp";
import { generateAuthToken } from "../utils/authToken";
import { AppError } from "../utils/AppError";

function genOtp(digits = 6) {
  const max = 10 ** digits;
  return Math.floor(Math.random() * max)
    .toString()
    .padStart(digits, "0");
}


async function sendOtp({ to, code, method,
}: {
  to: string;
  code: string;
  method: "email" | "phone";
}) {
  console.log(`Send OTP ${code} to ${to} via ${method}`);
}

export async function requestOtpHandler(body: any) {
  try {
    let { identifier, method = "email", purpose = "auth", role } = body;

    if (!identifier)
      throw new AppError(400, "Identifier required");

    identifier = String(identifier).trim().toLowerCase();

    const allowedRoles = [UserRole.USER, UserRole.CONTRACTOR];
    if (purpose === "auth" && (!role || !allowedRoles.includes(role)))
      throw new AppError(400, "Invalid role");

    /* ---------- RATE LIMIT ---------- */

    const last = await Otp.findOne({ identifier }).sort({ createdAt: -1 });

    if (last && Date.now() - last.createdAt.getTime() < (config.otp.resendIntervalSeconds || 60) * 1000)
      throw new AppError(429, "Wait before requesting another OTP");


    /* ---------- USER UPSERT ---------- */

    let user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      isDeleted: false,
    });

    if (!user && purpose === "auth") {
      user = await User.findOneAndUpdate(
        { $or: [{ email: identifier }, { phone: identifier }] },
        {
          $setOnInsert: {
            email: method === "email" ? identifier : undefined,
            phone: method === "phone" ? identifier : undefined,
            role,
            isActive: false,
            status: "pending",
          },
        },
        { upsert: true, new: true }
      );
    }


    /* ---------- OTP GENERATION ---------- */

    const digits = config.otp?.digits || 6;
    const ttlMinutes =
      purpose === "auth" ? config.otp?.ttlMinutes || 5 : 10;

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
      used: false,
    });

    await sendOtp({ to: identifier, code, method });

    return {
      success: true,
      otpId: otpDoc._id,
      ...(config.env === "dev" && { code }),
    };

  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return {
      success: false,
      status,
      message: err.message || "error",
    };
  }
}


export async function verifyOtpHandler(body: any) {
  try {
    let { otpId, identifier, code } = body;

    if (!otpId || !identifier || !code)
      throw new AppError(400, "Missing required fields");

    identifier = String(identifier).trim().toLowerCase();

    const otp = await Otp.findOne({
      _id: otpId,
      identifier,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) throw new AppError(400, "Invalid or expired OTP");

    if ((otp.attempts || 0) >= (config.otp?.maxAttempts || 5)) throw new AppError(429, "Too many attempts");

    const valid = await bcrypt.compare(code, otp.otpHash);

    if (!valid) {
      otp.attempts++;
      await otp.save();
      throw new AppError(400, "Invalid OTP");
    }

    await Otp.updateMany(
      { identifier, used: false },
      { $set: { used: true } }
    );

    let user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user && otp.userId)
      user = await User.findById(otp.userId);

    if (!user) throw new AppError(404, "User not found");

    const wasInactive = !user.isActive;

    if (otp.purpose === "auth") {

      user.isActive = true;

      if (otp.method === "email")
        user.emailVerified = true;

      if (otp.method === "phone")
        user.phoneVerified = true;

      await user.save();

      const { accessToken, userId } = await generateAuthToken(user);

      return {
        success: true,
        data: {
          accessToken,
          user: {
            userId,
            role: user.role,
            fullName: user.name,
            isNewUser: wasInactive,
          },
        },
      };
    }


    /* =====================================================
       VERIFICATION ONLY FLOW
    ===================================================== */

    if (otp.purpose === "verify_email")
      user.emailVerified = true;

    if (otp.purpose === "verify_phone")
      user.phoneVerified = true;

    await user.save();

    return {
      success: true,
      data: {
        message: `${otp.purpose.replace("_", " ")} successful`,
      },
    };

  } catch (err: any) {
    const status = err instanceof AppError ? err.status : 500;
    return {
      success: false,
      status,
      message: err.message || "error",
    };
  }
}