// src/controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../config";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

import User from "../models/User";
import Otp from "../models/Otp";
import Admin from "../models/Admin";
import Contractor from "../models/Contractor";
import Engineer from "../models/Engineer";

import { generateAuthToken } from "../utils/authToken";
import { passwordIsValid } from "../utils/security";

/* ---------------------------- Ensure Role Doc ---------------------------- */
async function ensureRoleDoc(user: any) {
  const uid = user._id;

  if (user.role === "admin") {
    if (!(await Admin.findOne({ userId: uid })))
      await Admin.create({ userId: uid, permissions: [] });
  }

  if (user.role === "contractor") {
    if (!(await Contractor.findOne({ userId: uid })))
      await Contractor.create({ userId: uid, companyName: "", engineerIds: [] });
  }

  if (user.role === "engineer") {
    if (!(await Engineer.findOne({ userId: uid })))
      await Engineer.create({ userId: uid, designation: "", department: "" });
  }
}

/* ---------------------------- SIGNUP ---------------------------- */
export async function signup(req: Request, res: Response) {
  try {
    const body = req.body || {};
    if (!body.email) {
      return res.status(200).json({ success: false, status: 400, message: "email required" });
    }

    const email = String(body.email).toLowerCase().trim();
    const role = body.role || "contractor";
    let user = await User.findOne({ email });

    /* -------- PASSWORD SIGNUP -------- */
    if (body.password) {
      if (user) {
        return res.status(200).json({
          success: false,
          status: 400,
          message: "user already exists",
        });
      }

      const hashed = await bcrypt.hash(body.password, 10);

      user = await User.create({
        email,
        password: hashed,
        name: body.name || "",
        phone: body.phone || null,
        role,
        isActive: true,
        isDeleted: false,
        status: "active",
        emailVerified: true,
      });

      await ensureRoleDoc(user);

      const { token, roleDoc } = await generateAuthToken(user);

      const { password, __v, createdAt, updatedAt, ...userData } = user.toObject();

      return res.status(200).json({
        success: true,
        status: 200,
        token,
        user: userData,
        roleData: roleDoc,
      });
    }

    /* -------- OTP SIGNUP FLOW -------- */
    if (!user) {
      user = await User.create({
        email,
        name: body.name || "",
        phone: body.phone || null,
        role,
        isActive: false,
        isDeleted: false,
        status: "pending",
      });
    } else if (user.isActive) {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "user already active, login instead",
      });
    }

    const digits = config.otp?.digits || 6;
    const ttl = config.otp?.ttlMinutes || 5;
    const code = Math.floor(Math.random() * 10 ** digits).toString().padStart(digits, "0");

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    const otpDoc = await Otp.create({
      userId: user._id,
      codeHash,
      method: body.method || "email",
      attempts: 0,
      used: false,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      otpId: otpDoc._id,
      code
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
}

/* ---------------------------- VERIFY OTP ---------------------------- */
export async function verifyContact(req: Request, res: Response) {
  try {
    const { otpId, userId, code, email } = req.body;

    if (!code && !otpId) {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "otp code required",
      });
    }

    let otpRec = null;

    if (otpId) otpRec = await Otp.findById(otpId);
    else if (userId) otpRec = await Otp.findOne({ userId, used: false }).sort({ createdAt: -1 });
    else if (email) {
      const u = await User.findOne({ email });
      if (!u)
        return res.status(200).json({ success: false, status: 400, message: "user not found" });

      otpRec = await Otp.findOne({ userId: u._id, used: false }).sort({ createdAt: -1 });
    }

    if (!otpRec)
      return res.status(200).json({ success: false, status: 400, message: "otp not found" });

    if (otpRec.expiresAt < new Date())
      return res.status(200).json({ success: false, status: 400, message: "otp expired" });

    if (otpRec.attempts >= (config.otp?.maxAttempts || 5))
      return res.status(200).json({ success: false, status: 400, message: "otp locked" });

    const providedHash = crypto.createHash("sha256").update(String(code)).digest("hex");
    if (providedHash !== otpRec.codeHash) {
      otpRec.attempts++;
      await otpRec.save();
      return res.status(200).json({ success: false, status: 400, message: "invalid otp" });
    }

    otpRec.used = true;
    await otpRec.save();

    const user = await User.findById(otpRec.userId);
    if (!user)
      return res.status(200).json({ success: false, status: 400, message: "user missing" });

    user.isActive = true;
    user.status = "active";
    user.emailVerified = true;
    if (otpRec.method === "sms") user.phoneVerified = true;
    await user.save();

    await ensureRoleDoc(user);

    const { token, roleDoc } = await generateAuthToken(user);

    const { password, __v, createdAt, updatedAt, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      status: 200,
      token,
      user: userData,
      roleData: roleDoc,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
}

/* ---------------------------- LOGIN ---------------------------- */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "email and password required",
      });
    }

    const emailNormalized = String(email).toLowerCase().trim();

    const user = await User.findOne({
      email: emailNormalized,
      isDeleted: false,
    })
      .select("+password email role isActive isDeleted name")
      .exec();

    if (!user)
      return res.status(200).json({ success: false, status: 404, message: "user not found" });

    const ok = await bcrypt.compare(String(password), user.password || "");
    if (!ok)
      return res.status(200).json({ success: false, status: 401, message: "invalid credentials" });

    if (user.isDeleted)
      return res
        .status(200)
        .json({ success: false, status: 403, message: "account removed" });

    if (!user.isActive)
      return res
        .status(200)
        .json({ success: false, status: 403, message: "account not active" });

    await ensureRoleDoc(user);

    const { token, roleDoc } = await generateAuthToken(user);

    return res.status(200).json({
      success: true,
      status: 200,
      role: user.role,
      token,
      data: roleDoc,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
}
