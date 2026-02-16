import bcrypt from "bcryptjs";
import User from "../models/core/User";
import { ensureRoleDoc, generateAuthToken } from "../utils/authToken";
import { passwordIsValid } from "../utils/security";
import { AppError } from "../utils/AppError";

/* ---------------------------- SIGNUP ---------------------------- */
export async function signupController(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  role: string = "contractor"
) {
  if (!email && !phone) throw new AppError(400, "email/phone required");
  if (!password) throw new AppError(400, "password required");

  const emailNorm = email ? email.toLowerCase().trim() : undefined;
  const phoneNorm = phone ? phone.trim() : undefined;
  const conditions = [
    emailNorm ? { email: emailNorm } : undefined,
    phoneNorm ? { phone: phoneNorm } : undefined,
  ].filter(
    (v): v is { email: string } | { phone: string } => v !== undefined
  );

  let user = await User.findOne({ isDeleted: false, $or: conditions });
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
    emailVerified: true,
  });

  await ensureRoleDoc(user);

  const { accessToken, roleId, userId } = await generateAuthToken(user);

  return {
    success: true,
    status: 200,
    data: {
      accessToken,
      user: {
        roleId, userId, fullName: user.name
      }
    }
  }
}

/* ---------------------------- LOGIN ---------------------------- */
export async function loginController(email: string, password: string, phone: string) {
  if (!email && !phone) throw new AppError(400, "email/phone required");
  if (!password) throw new AppError(400, "password required");

  const emailNorm = email.toLowerCase().trim();
  const phoneNorm = phone ? phone.trim() : undefined;
  const conditions = [
    emailNorm ? { email: emailNorm } : undefined,
    phoneNorm ? { phone: phoneNorm } : undefined,
  ].filter(
    (v): v is { email: string } | { phone: string } => v !== undefined
  );

  let user = await User.findOne({ isDeleted: false, $or: conditions }).select("+password");

  if (!user) throw new AppError(404, "user not found");

  const ok = await bcrypt.compare(String(password), user.password || "");
  if (!ok) throw new AppError(401, "invalid credentials");

  if (user.isDeleted) throw new AppError(403, "account removed");
  if (!user.isActive) throw new AppError(403, "account not active");
  await ensureRoleDoc(user);

  const { accessToken, roleId, userId } = await generateAuthToken(user);

  return {
    success: true,
    status: 200,
    data: {
      accessToken,
      user: {
        roleId, userId, fullName: user.name
      }
    }
  };
}