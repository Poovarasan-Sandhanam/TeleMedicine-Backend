import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from "path" 
import fs from "fs"
import {UserDocument} from "../interfaces/user.interface";



dotenv.config();

// Load JWT secret from environment variables or a private key file
const JWT_SECRET = fs.readFileSync(path.join(__dirname, "../../private.key"), "utf8");

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
