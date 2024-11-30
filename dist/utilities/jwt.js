"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
// Load JWT secret from environment variables or a private key file
const JWT_SECRET = fs_1.default.readFileSync(path_1.default.join(__dirname, "../../private.key"), "utf8");
// Function to generate JWT token
const generateToken = (user) => {
    // Generate token with user ID and email as payload
    return jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '48h' });
};
exports.generateToken = generateToken;
// Function to verify JWT token
const verifyToken = (token) => {
    // Verify token and return decoded payload
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
