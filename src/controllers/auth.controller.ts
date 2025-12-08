import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../config";

import User from "../models/User";
import Otp from "../models/Otp";
import Admin from "../models/Admin";
import Contractor from "../models/Contractor";
import Engineer from "../models/Engineer";

import { generateAuthToken } from "../utils/authToken";
import { passwordIsValid } from "../utils/security";
import { AppError } from "../utils/AppError";

/* ---------------------------- Ensure Role Doc ---------------------------- */
async function ensureRoleDoc(user: any) {
  const uid = user._id;

  if (user.role === "admin") {
    if (!(await Admin.findOne({ userId: uid })))
      await Admin.create({ userId: uid, permissions: [] });
  }

  if (user.role === "contractor") {
    if (!(await Contractor.findOne({ userId: uid })))
      await Contractor.create({
        userId: uid,
        companyName: "",
        engineerIds: [],
      });
  }

  if (user.role === "engineer") {
    if (!(await Engineer.findOne({ userId: uid })))
      await Engineer.create({
        userId: uid,
        designation: "",
        department: "",
      });
  }
}

/* ---------------------------- SIGNUP ---------------------------- */
// supports both:
// - password signup
// - otp signup (no password)
export async function signupController(
  email: string,
  password?: string,
  name?: string,
  phone?: string,
  role: string = "contractor",
  method: string = "email"
) {
  if (!email || !phone) throw new AppError(400, "contact required");

  const emailNorm = email.toLowerCase().trim();
  let user = await User.findOne({ email: emailNorm });

  // --- PASSWORD SIGNUP ---
  if (password) {
    if (user) throw new AppError(400, "user already exists");

    // const passCheck = passwordIsValid(password);
    // if (!passCheck.success) {
    //   throw new AppError(400, passCheck.reason || "invalid password");
    // }

    const hashed = await bcrypt.hash(password, 10);

    user = await User.create({
      email: emailNorm,
      password: hashed,
      name: name || "",
      phone: phone || null,
      role,
      isActive: true,
      isDeleted: false,
      status: "active",
      emailVerified: true,
    });

    await ensureRoleDoc(user);

    const { token, roleDoc } = await generateAuthToken(user);
    const { password: p, __v, createdAt, updatedAt, ...userData } =
      user.toObject();

    return {
      success: true,
      status: 200,
      token,
      user: userData,
      roleData: roleDoc,
    };
  }

  // --- OTP SIGNUP FLOW ---
  if (!user) {
    user = await User.create({
      email: emailNorm,
      name: name || "",
      phone: phone || null,
      role,
      isActive: false,
      isDeleted: false,
      status: "pending",
    });
  } else if (user.isActive) {
    throw new AppError(400, "user already active, login instead");
  }

  const digits = config.otp?.digits || 6;
  const ttl = config.otp?.ttlMinutes || 5;
  const code = Math.floor(Math.random() * 10 ** digits)
    .toString()
    .padStart(digits, "0");

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

  const otpDoc = await Otp.create({
    userId: user._id,
    codeHash,
    method,
    attempts: 0,
    used: false,
    expiresAt,
  });

  return {
    success: true,
    status: 200,
    otpId: otpDoc._id,
    code, // dev-only; remove in prod
  };
}

/* ---------------------------- LOGIN ---------------------------- */
export async function loginController(email: string, password: string) {
  if (!email || !password) {
    throw new AppError(400, "email and password required");
  }

  const emailNorm = email.toLowerCase().trim();

  const user = await User.findOne({
    email: emailNorm,
    isDeleted: false,
  }).select("+password");

  if (!user) throw new AppError(404, "user not found");

  const ok = await bcrypt.compare(String(password), user.password || "");
  if (!ok) throw new AppError(401, "invalid credentials");

  if (user.isDeleted) throw new AppError(403, "account removed");
  if (!user.isActive) throw new AppError(403, "account not active");

  await ensureRoleDoc(user);

  const { token, roleDoc } = await generateAuthToken(user);

  return {
    success: true,
    status: 200,
    role: user.role,
    token,
    data: roleDoc,
  };
}

/* ---------------------------- VERIFY CONTACT (OTP) ---------------------------- */
export async function verifyContactController(
  otpId?: string,
  userId?: string,
  code?: string,
  email?: string
) {
  if (!code) throw new AppError(400, "otp code required");

  let otpRec: any = null;

  if (otpId) {
    otpRec = await Otp.findById(otpId);
  } else if (userId) {
    otpRec = await Otp.findOne({ userId, used: false }).sort({
      createdAt: -1,
    });
  } else if (email) {
    const u = await User.findOne({ email });
    if (!u) throw new AppError(400, "user not found");

    otpRec = await Otp.findOne({ userId: u._id, used: false }).sort({
      createdAt: -1,
    });
  }

  if (!otpRec) throw new AppError(400, "otp not found");
  if (otpRec.expiresAt < new Date()) throw new AppError(400, "otp expired");
  if (otpRec.attempts >= (config.otp?.maxAttempts || 5)) {
    throw new AppError(400, "otp locked");
  }

  const providedHash = crypto.createHash("sha256").update(String(code)).digest("hex");
  if (providedHash !== otpRec.codeHash) {
    otpRec.attempts++;
    await otpRec.save();
    throw new AppError(400, "invalid otp");
  }

  otpRec.used = true;
  await otpRec.save();

  const user = await User.findById(otpRec.userId);
  if (!user) throw new AppError(400, "user missing");

  user.isActive = true;
  user.status = "active";
  user.emailVerified = true;
  if (otpRec.method === "sms") user.phoneVerified = true;
  await user.save();

  await ensureRoleDoc(user);

  const { token, roleDoc } = await generateAuthToken(user);
  const { password, __v, createdAt, updatedAt, ...userData } =
    user.toObject();

  return {
    success: true,
    status: 200,
    token,
    user: userData,
    roleData: roleDoc,
  };
}
