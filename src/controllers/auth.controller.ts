import bcrypt from "bcryptjs";
import User, { UserRole, IUser } from "../models/core/User";
import { generateAuthToken } from "../utils/authToken";
import { AppError } from "../utils/AppError";

/* =========================================================
   SIGNUP CONTROLLER
========================================================= */
export async function signupController(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  role: UserRole = UserRole.CONTRACTOR
) {

  if (!email && !phone) throw new AppError(400, "email/phone required");

  if (!password) throw new AppError(400, "password required");

  if (!Object.values(UserRole).includes(role)) throw new AppError(400, "Invalid role");

  if (role === UserRole.ADMIN) throw new AppError(403, "Cannot signup as admin");

  const emailNorm = email ? email.toLowerCase().trim() : undefined;
  const phoneNorm = phone ? phone.trim() : undefined;

  const conditions = [
    emailNorm ? { email: emailNorm } : undefined,
    phoneNorm ? { phone: phoneNorm } : undefined,
  ].filter(Boolean) as any[];


  const existing = await User.findOne({ isDeleted: false, $or: conditions });

  if (existing) throw new AppError(400, "User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user: IUser = await User.create({
    email: emailNorm,
    password: hashed,
    name: name || "",
    phone: phoneNorm || "",
    role,
    isActive: true,
    isDeleted: false,
    emailVerified: true,
  });

  const { accessToken, userId } = await generateAuthToken(user);

  return {
    success: true,
    status: 200,
    data: {
      accessToken,
      user: {
        userId,
        role: user.role,
        fullName: user.name
      }
    }
  };
}



/* =========================================================
   LOGIN CONTROLLER
========================================================= */
export async function loginController(
  email: string,
  password: string,
  phone?: string
) {
  /* ---------- VALIDATION ---------- */

  if (!email && !phone) throw new AppError(400, "email/phone required");

  if (!password) throw new AppError(400, "password required");

  const emailNorm = email ? email.toLowerCase().trim() : undefined;
  const phoneNorm = phone ? phone.trim() : undefined;

  const conditions = [
    emailNorm ? { email: emailNorm } : undefined,
    phoneNorm ? { phone: phoneNorm } : undefined,
  ].filter(Boolean) as any[];

  const user = await User.findOne({ isDeleted: false, $or: conditions }).select("+password");

  if (!user) throw new AppError(404, "User not found");

  const ok = await bcrypt.compare(password, user.password || "");

  if (!ok) throw new AppError(401, "Invalid credentials");

  if (user.isDeleted) throw new AppError(403, "Account removed");

  if (!user.isActive) throw new AppError(403, "Account not active");

  const { accessToken, userId } = await generateAuthToken(user);

  return {
    success: true,
    status: 200,
    data: {
      accessToken,
      user: {
        userId,
        role: user.role,
        fullName: user.name
      }
    }
  };
}