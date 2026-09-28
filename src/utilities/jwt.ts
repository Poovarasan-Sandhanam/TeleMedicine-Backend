import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from "path" 
import fs from "fs"
import {UserDocument} from "../interfaces/user.interface";



dotenv.config();

/**
 * Signing secret. Prefer JWT_SECRET from the environment; fall back to the
 * private.key file only if it is present, so existing local setups keep working.
 *
 * The committed private.key was exposed in public git history and must be treated
 * as compromised - set JWT_SECRET in every environment and delete the file.
 */
const loadSecret = (): string => {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.trim() !== "") {
    return fromEnv;
  }

  const keyPath = path.join(__dirname, "../../private.key");
  if (fs.existsSync(keyPath)) {
    console.warn(
      "[jwt] Falling back to private.key. This key was committed to a public " +
      "repository - set JWT_SECRET and remove the file."
    );
    return fs.readFileSync(keyPath, "utf8");
  }

  throw new Error("JWT_SECRET is not set and no private.key fallback is available");
};

const JWT_SECRET = loadSecret();

// Function to generate JWT token
export const generateToken = (user: UserDocument): string => {
  // Generate token with user ID and email as payload
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '48h' });
};

// Function to verify JWT token
export const verifyToken = (token: string): any => {
  // Verify token and return decoded payload
  return jwt.verify(token, JWT_SECRET);
};
